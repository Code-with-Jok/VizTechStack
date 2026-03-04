import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConvexService } from './common/convex/convex.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly convex: ConvexService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get hello message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('seed')
  @ApiOperation({ summary: 'Seed initial data to Convex' })
  @ApiResponse({ status: 200, description: 'Seed result message' })
  async seedData() {
    try {
      const result = await this.convex.client.mutation('seed:seed' as any, {});
      return { success: true, message: result as string };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to seed data',
        error: errorMessage,
      };
    }
  }
}
