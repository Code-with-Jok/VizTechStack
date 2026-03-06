import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { randomUUID } from 'node:crypto';
import { GraphQLError } from 'graphql';
import { RoadmapDomainError } from '../../../domain/errors/roadmap-domain-error';

@Catch(RoadmapDomainError)
export class RoadmapDomainExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(RoadmapDomainExceptionFilter.name);

  catch(exception: RoadmapDomainError, host: ArgumentsHost): GraphQLError {
    const gqlHost = GqlArgumentsHost.create(host);
    gqlHost.getContext();
    const traceId = randomUUID();

    this.logger.error(
      JSON.stringify({
        traceId,
        module: exception.module,
        operation: exception.operation,
        severity: exception.severity,
        code: exception.code,
        message: exception.message,
      }),
    );

    // Infrastructure/authorization errors (high severity) → generic client message
    // to avoid leaking internal details. Validation errors (low) → pass through.
    const isHighSeverity = exception.severity === 'high';

    const clientMessage = isHighSeverity
      ? 'An internal error occurred. Please try again later.'
      : exception.message;

    return new GraphQLError(clientMessage, {
      extensions: {
        traceId,
        code: exception.code,
      },
    });
  }
}
