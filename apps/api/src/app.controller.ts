import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { ConvexService } from './common/convex/convex.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { api } from '../../../convex/_generated/api';

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
    if (process.env.NODE_ENV !== 'development') {
      throw new HttpException(
        'Seed endpoint only allowed in development',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      const result = (await this.convex.client.mutation(
        api.seed.seed,
        {},
      )) as string;
      return { success: true, message: result };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to seed data',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
