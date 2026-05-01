import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UsePipes,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { UserRole, UserStatus } from '@smartjob/shared';
import {
  UpdateUserDto,
  UpdateUserSchema,
  PaginationQueryDto,
  PaginationQuerySchema,
  UpdateJobSeekerProfileDto,
  UpdateJobSeekerProfileSchema,
  UpdateEmployerProfileDto,
  UpdateEmployerProfileSchema,
} from './dto';

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

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Return paginated users' })
  async listUsers(@Query(new ZodValidationPipe(PaginationQuerySchema)) query: PaginationQueryDto) {
    return this.usersService.listUsers(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return current user' })
  async getMe(@Req() req: RequestWithUser) {
    return this.usersService.getUserById(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Return user by ID' })
  async getUser(@Param('id') id: string, @Req() req: RequestWithUser) {
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only access your own data');
    }
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user basic fields' })
  @ApiResponse({ status: 200, description: 'User updated' })
  async updateUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateUserSchema)) data: UpdateUserDto,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own data');
    }
    return this.usersService.updateUser(id, data);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Get full profile' })
  @ApiResponse({ status: 200, description: 'Return full profile' })
  async getProfile(@Param('id') id: string, @Req() req: RequestWithUser) {
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only access your own profile');
    }
    return this.usersService.getUserById(id);
  }

  @Put(':id/profile/job-seeker')
  @ApiOperation({ summary: 'Update job seeker profile' })
  @ApiResponse({ status: 200, description: 'Job seeker profile updated' })
  async updateJobSeekerProfile(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateJobSeekerProfileSchema)) data: UpdateJobSeekerProfileDto,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.updateJobSeekerProfile(id, data);
  }

  @Put(':id/profile/employer')
  @ApiOperation({ summary: 'Update employer profile' })
  @ApiResponse({ status: 200, description: 'Employer profile updated' })
  async updateEmployerProfile(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateEmployerProfileSchema)) data: UpdateEmployerProfileDto,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.updateEmployerProfile(id, data);
  }

  @Post(':id/role')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign role (Admin only)' })
  @ApiResponse({ status: 200, description: 'Role assigned' })
  async assignRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.assignRole(id, role);
  }

  @Post(':id/status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(@Param('id') id: string, @Body('status') status: UserStatus) {
    return this.usersService.updateStatus(id, status);
  }
}
