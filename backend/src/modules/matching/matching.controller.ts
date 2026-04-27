import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('matching')
@Controller('matching')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post('jobs')
  @ApiOperation({ summary: 'Match jobs based on a query string' })
  async matchJobs(
    @Body() data: { query: string; jobs: Array<{ id: string; title: string; description: string }> },
  ) {
    return this.matchingService.matchJobs(data.query, data.jobs);
  }

  @Get('similarity')
  @ApiOperation({ summary: 'Calculate similarity between two texts' })
  async getSimilarity(
    @Query('text1') text1: string,
    @Query('text2') text2: string,
  ) {
    return this.matchingService.getSimilarity(text1, text2);
  }
}
