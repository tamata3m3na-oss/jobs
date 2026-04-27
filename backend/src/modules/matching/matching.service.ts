import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);
  private readonly aiServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.aiServiceUrl = this.configService.get<string>('aiService.url');
  }

  async matchJobs(query: string, jobs: Array<{ id: string; title: string; description: string }>) {
    try {
      const response = await fetch(`${this.aiServiceUrl}/api/v1/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, jobs }),
      });

      if (!response.ok) {
        throw new Error(`AI Service returned ${response.status}`);
      }

      const result = await response.json();
      return result.results;
    } catch (error) {
      this.logger.error(`Failed to call AI Service: ${error.message}`);
      return jobs.map(job => ({ job_id: job.id, score: 0 }));
    }
  }

  async getSimilarity(text1: string, text2: string) {
    try {
      const response = await fetch(`${this.aiServiceUrl}/api/v1/similarity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text1, text2 }),
      });

      if (!response.ok) {
        throw new Error(`AI Service returned ${response.status}`);
      }

      const result = await response.json();
      return result.score;
    } catch (error) {
      this.logger.error(`Failed to call AI Service: ${error.message}`);
      return 0;
    }
  }
}
