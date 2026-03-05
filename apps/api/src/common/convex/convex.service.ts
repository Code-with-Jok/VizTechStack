import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConvexHttpClient } from 'convex/browser';
import { serverEnv } from '../../../../../tooling/env/src/server';

@Injectable()
export class ConvexService implements OnModuleInit {
  public client!: ConvexHttpClient;

  onModuleInit() {
    this.client = new ConvexHttpClient(serverEnv.CONVEX_URL);
  }
}
