import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { randomUUID } from 'node:crypto';
import { GraphQLError } from 'graphql';
import {
  RoadmapDomainError,
  RoadmapValidationDomainError,
  RoadmapAuthorizationDomainError,
  RoadmapNotFoundDomainError,
  RoadmapDuplicateDomainError,
  RoadmapParsingDomainError,
} from '../../../domain/errors/roadmap-domain-error';

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

    // Map domain errors to HTTP status codes
    const statusCode = this.getStatusCode(exception);

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
        statusCode,
      },
    });
  }

  private getStatusCode(exception: RoadmapDomainError): number {
    if (exception instanceof RoadmapValidationDomainError) {
      return 400; // Bad Request
    }
    if (exception instanceof RoadmapAuthorizationDomainError) {
      return 403; // Forbidden
    }
    if (exception instanceof RoadmapNotFoundDomainError) {
      return 404; // Not Found
    }
    if (exception instanceof RoadmapDuplicateDomainError) {
      return 409; // Conflict
    }
    if (exception instanceof RoadmapParsingDomainError) {
      return 422; // Unprocessable Entity
    }
    // Default for unknown errors
    return 500; // Internal Server Error
  }
}
