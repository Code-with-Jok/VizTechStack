import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConvexClient } from 'convex/browser';

@Injectable()
export class ConvexService implements OnModuleInit {
  private client!: ConvexClient;
  private readonly logger = new Logger(ConvexService.name);

  onModuleInit() {
    const convexUrl = process.env.CONVEX_URL;
    if (!convexUrl) {
      throw new Error('CONVEX_URL environment variable is required');
    }
    this.client = new ConvexClient(convexUrl);
    this.logger.log('Convex client initialized');
  }

  getClient(): ConvexClient {
    return this.client;
  }

  async query<T>(name: string, args?: Record<string, unknown>): Promise<T> {
    type QueryFunction = (
      name: string,
      args: Record<string, unknown>,
    ) => Promise<T>;
    return (this.client.query as unknown as QueryFunction)(name, args ?? {});
  }

  async mutation<T>(name: string, args?: Record<string, unknown>): Promise<T> {
    type MutationFunction = (
      name: string,
      args: Record<string, unknown>,
    ) => Promise<T>;
    return (this.client.mutation as unknown as MutationFunction)(
      name,
      args ?? {},
    );
  }
}
