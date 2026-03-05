import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class PingResolver {
  @Query(() => String)
  ping(): string {
    return 'pong';
  }
}
