import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConvexHttpClient } from 'convex/browser';
import { serverEnv } from '@viztechstack/env/server';

@Injectable()
export class ConvexService implements OnModuleInit {
  public client!: ConvexHttpClient;

  onModuleInit() {
    this.client = new ConvexHttpClient(serverEnv.CONVEX_URL);
  }
}
