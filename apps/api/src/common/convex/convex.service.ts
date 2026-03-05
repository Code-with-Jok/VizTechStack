import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConvexHttpClient } from 'convex/browser';

@Injectable()
export class ConvexService implements OnModuleInit {
  public client!: ConvexHttpClient;

  onModuleInit() {
    const url = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error(
        'CONVEX_URL or NEXT_PUBLIC_CONVEX_URL must be defined in environment variables.',
      );
    }
    this.client = new ConvexHttpClient(url);
  }
}
