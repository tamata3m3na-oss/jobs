import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('admin')
  @Roles('ADMIN')
  getAdminStats() {
    return this.analyticsService.getAdminStats();
  }

  @Get('employer')
  @Roles('EMPLOYER')
  getEmployerStats(@Request() req: { user: { id: string } }) {
    return this.analyticsService.getEmployerStats(req.user.id);
  }

  @Get('revenue')
  @Roles('ADMIN')
  getRevenueStats() {
    return this.analyticsService.getRevenueStats();
  }
}
