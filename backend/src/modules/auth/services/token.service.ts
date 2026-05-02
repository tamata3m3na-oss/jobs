import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../database/prisma.service';
import { UserRole } from '@smartjob/shared';

const BCRYPT_SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async generateAccessToken(userId: string, email: string, role: UserRole): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: userId,
      email,
      role,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret') || 'super-secret',
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const payload: RefreshTokenPayload = {
      sub: userId,
      type: 'refresh',
    };

    const token = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('jwt.refreshSecret') ||
        `${this.configService.get<string>('jwt.secret') || 'super-secret'}-refresh`,
      expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
    });

    return token;
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this.configService.get<string>('jwt.secret') || 'super-secret',
      });

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret:
          this.configService.get<string>('jwt.refreshSecret') ||
          `${this.configService.get<string>('jwt.secret') || 'super-secret'}-refresh`,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const hashedToken = this.hashToken(token);
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: hashedToken },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      if (storedToken.expiresAt < new Date()) {
        await this.prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });
        throw new UnauthorizedException('Refresh token has expired');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  hashToken(token: string): string {
    return bcrypt.hashSync(token, BCRYPT_SALT_ROUNDS);
  }

  async rotateRefreshToken(userId: string, oldRefreshToken: string): Promise<TokenPair> {
    const payload = await this.verifyRefreshToken(oldRefreshToken);

    const hashedOldToken = this.hashToken(oldRefreshToken);
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId: payload.sub,
        token: hashedOldToken,
      },
    });

    const newAccessToken = await this.generateAccessToken(
      userId,
      (await this.getUserEmail(userId)) ?? '',
      (await this.getUserRole(userId)) ?? 'JOB_SEEKER'
    );

    const newRefreshToken = await this.generateRefreshToken(userId);

    await this.storeRefreshToken(userId, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
      tokenType: 'Bearer',
    };
  }

  async createTokenPair(userId: string, email: string, role: UserRole): Promise<TokenPair> {
    const accessToken = await this.generateAccessToken(userId, email, role);
    const refreshToken = await this.generateRefreshToken(userId);

    await this.storeRefreshToken(userId, refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      tokenType: 'Bearer',
    };
  }

  async storeRefreshToken(userId: string, token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    const hashedToken = this.hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId,
        expiresAt,
      },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  private async getUserEmail(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    return user?.email ?? null;
  }

  private async getUserRole(userId: string): Promise<UserRole | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role ?? null;
  }
}
