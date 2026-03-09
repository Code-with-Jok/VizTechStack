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
      .setDescription(
        'VizTechStack API - GraphQL API for technology roadmap visualization platform\n\n' +
          '## GraphQL Endpoint\n' +
          'Access the GraphQL API at `/graphql`\n\n' +
          '## Available Features\n' +
          '- **Roadmap Management**: CRUD operations for technology roadmaps (Admin only)\n' +
          '- **Public Access**: Read-only access to published roadmaps for all users\n' +
          '- **Role-Based Access Control**: Admin and User roles with different permissions\n\n' +
          '## Authentication\n' +
          'API uses Clerk JWT authentication. Include the JWT token in the Authorization header:\n' +
          '```\nAuthorization: Bearer <your-jwt-token>\n```\n\n' +
          '## Roles\n' +
          '- **Guest**: Read-only access to published roadmaps (no authentication required)\n' +
          '- **User**: Read-only access to published roadmaps (authentication required)\n' +
          '- **Admin**: Full CRUD access to roadmaps (authentication required)\n\n' +
          '## GraphQL Operations\n' +
          '### Queries (Public)\n' +
          '- `roadmaps`: Get all published roadmaps\n' +
          '- `roadmap(slug: String!)`: Get a single roadmap by slug\n\n' +
          '### Mutations (Admin Only)\n' +
          '- `createRoadmap(input: CreateRoadmapInput!)`: Create a new roadmap\n' +
          '- `updateRoadmap(input: UpdateRoadmapInput!)`: Update an existing roadmap\n' +
          '- `deleteRoadmap(id: String!)`: Delete a roadmap\n\n' +
          '## Error Codes\n' +
          '- `UNAUTHENTICATED` (401): Missing or invalid JWT token\n' +
          '- `FORBIDDEN` (403): Insufficient permissions for the operation\n' +
          '- `BAD_REQUEST` (400): Invalid input data\n' +
          '- `NOT_FOUND` (404): Resource not found\n',
      )
      .setVersion('1.0')
      .addTag('graphql', 'GraphQL API endpoints')
      .addTag('health', 'Health check endpoints')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Clerk JWT token',
        },
        'JWT-auth',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  console.log(`\n🚀 API is running on: http://127.0.0.1:${serverEnv.PORT}`);
  console.log(
    `📊 GraphQL Playground: http://127.0.0.1:${serverEnv.PORT}/graphql`,
  );
  console.log(`📚 API Documentation: http://127.0.0.1:${serverEnv.PORT}/api\n`);

  await app.listen(serverEnv.PORT);
}
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
