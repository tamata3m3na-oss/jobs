import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  UpdateJobSeekerProfileSchema,
  UpdateEmployerProfileSchema,
} from '@smartjob/shared';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@Request() req: { user: { id: string } }) {
    return this.usersService.findOne(req.user.id);
  }

  @Put('profile/job-seeker')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UsePipes(new ZodValidationPipe(UpdateJobSeekerProfileSchema))
  @ApiOperation({ summary: 'Update job seeker profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateJobSeekerProfile(
    @Request() req: { user: { id: string } },
    @Body() data: Record<string, unknown>,
  ) {
    return this.usersService.updateProfile(req.user.id, data as never);
  }

  @Put('profile/employer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UsePipes(new ZodValidationPipe(UpdateEmployerProfileSchema))
  @ApiOperation({ summary: 'Update employer profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateEmployerProfile(
    @Request() req: { user: { id: string } },
    @Body() data: Record<string, unknown>,
  ) {
    return this.usersService.updateProfile(req.user.id, data as never);
  }
}