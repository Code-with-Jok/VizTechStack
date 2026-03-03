import "reflect-metadata";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env trước khi NestJS bootstrap
dotenv.config({ path: resolve(__dirname, "../.env") });

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env["FRONTEND_URL"] ?? "http://localhost:3000",
    credentials: true,
  });

  const port = process.env["PORT"] ?? 4000;
  await app.listen(port);
  console.log(`🚀 API ready at http://localhost:${port}/graphql`);
  console.log(`📡 Convex URL: ${process.env["CONVEX_URL"] ?? "NOT SET"}`);
}

bootstrap();
