import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  RegisterJobSeekerSchema,
  RegisterEmployerSchema,
  RegisterJobSeeker,
  RegisterEmployer,
} from '@smartjob/shared';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/job-seeker')
  @ApiOperation({ summary: 'Register as a job seeker' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @UsePipes(new ZodValidationPipe(RegisterJobSeekerSchema))
  async registerJobSeeker(@Body() data: RegisterJobSeeker) {
    return this.authService.registerJobSeeker(data);
  }

  @Post('register/employer')
  @ApiOperation({ summary: 'Register as an employer' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @UsePipes(new ZodValidationPipe(RegisterEmployerSchema))
  async registerEmployer(@Body() data: RegisterEmployer) {
    return this.authService.registerEmployer(data);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  async login(@Request() req: { user: Record<string, unknown> }) {
    return this.authService.login(req.user);
  }
}