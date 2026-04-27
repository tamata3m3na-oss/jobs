import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  UpdateJobSeekerProfile,
  UpdateEmployerProfile,
  UserRole,
} from '@smartjob/shared';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return current user' })
  async getMe(@Request() req: { user: { id: string } }) {
    return this.usersService.findOne(req.user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(
    @Request() req: { user: { id: string } },
    @Body() profileData: UpdateJobSeekerProfile | UpdateEmployerProfile,
  ) {
    return this.usersService.updateProfile(req.user.id, profileData);
  }

  @Get()
  @Roles('ADMIN' as UserRole)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  async findAll() {
    return this.usersService.findAll();
  }
}
