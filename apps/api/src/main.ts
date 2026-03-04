import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { serverEnv } from '@viztechstack/env/server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(serverEnv.PORT);
}
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
