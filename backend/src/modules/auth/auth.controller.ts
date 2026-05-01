import type { Request, Response } from 'express';
import * as shared from '@smartjob/shared';
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UsePipes,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiCookieAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { TokenService } from './services/token.service';
import {
  RefreshTokenSchema,
  LogoutSchema,
  RegisterJobSeekerSchema,
  RegisterEmployerSchema,
} from './dto';

type RegisterJobSeeker = shared.RegisterJobSeeker;
type RegisterEmployer = shared.RegisterEmployer;
type UserRole = shared.UserRole;

interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  @Post('register/job-seeker')
  @ApiOperation({ summary: 'Register as a job seeker' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered with tokens',
  })
  @UsePipes(new ZodValidationPipe(RegisterJobSeekerSchema))
  async registerJobSeeker(
    @Body() data: RegisterJobSeeker,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.registerJobSeeker(data);
    this.setRefreshTokenCookie(res, result.tokens.refreshToken);
    return result;
  }

  @Post('register/employer')
  @ApiOperation({ summary: 'Register as an employer' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered with tokens',
  })
  @UsePipes(new ZodValidationPipe(RegisterEmployerSchema))
  async registerEmployer(
    @Body() data: RegisterEmployer,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.registerEmployer(data);
    this.setRefreshTokenCookie(res, result.tokens.refreshToken);
    return result;
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login with credentials' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  async login(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(req.user);
    this.setRefreshTokenCookie(res, result.tokens.refreshToken);
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'New access token generated' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshTokens(
    @Body() body: { refreshToken?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = body.refreshToken || this.getRefreshTokenFromCookie(req);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);
      const user = await this.authService.getUserById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newTokens = await this.tokenService.rotateRefreshToken(user.id, refreshToken);

      this.setRefreshTokenCookie(res, newTokens.refreshToken);
      return {
        user,
        tokens: newTokens,
      };
    } catch {
      this.clearRefreshTokenCookie(res);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  async logout(
    @Body() body: { refreshToken?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = body.refreshToken || this.getRefreshTokenFromCookie(req);
    this.clearRefreshTokenCookie(res);

    if (refreshToken) {
      try {
        const payload = await this.tokenService.verifyRefreshToken(refreshToken);
        await this.authService.logout(payload.sub);
      } catch {
        // Token invalid or expired - still clear the cookie
      }
    }

    return { message: 'Successfully logged out' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: RequestWithUser) {
    const user = await this.authService.getUserById(req.user.id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      ...COOKIE_OPTIONS,
    });
  }

  private getRefreshTokenFromCookie(req: Request): string | undefined {
    return req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
  }
}
