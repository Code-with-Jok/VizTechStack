import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { serverEnv } from '@viztechstack/env/server';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (serverEnv.NODE_ENV === 'production') {
    app.enableCors({ origin: serverEnv.WEB_APP_ORIGIN });
  } else {
    app.enableCors();
  }

  if (serverEnv.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('VizTechStack API')
      .setDescription('The VizTechStack API description')
      .setVersion('1.0')
      .addTag('api')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  console.log(`API is running on: http://127.0.0.1:${serverEnv.PORT}/graphql`);
  console.log(`Swagger documentation: http://127.0.0.1:${serverEnv.PORT}/api`);

  await app.listen(serverEnv.PORT);
}
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
