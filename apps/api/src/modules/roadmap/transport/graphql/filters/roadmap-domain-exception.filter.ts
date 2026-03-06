import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { randomUUID } from 'node:crypto';
import { GraphQLError } from 'graphql';
import { RoadmapDomainError } from '../../../domain/errors/roadmap-domain-error';

interface GraphqlRequestContext {
  req?: {
    user?: {
      sub?: string;
    };
  };
}

@Catch(RoadmapDomainError)
export class RoadmapDomainExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(RoadmapDomainExceptionFilter.name);

  catch(exception: RoadmapDomainError, host: ArgumentsHost): GraphQLError {
    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext<GraphqlRequestContext>();
    const traceId = randomUUID();
    const userId = context.req?.user?.sub ?? 'anonymous';

    this.logger.error(
      JSON.stringify({
        traceId,
        userId,
        module: exception.module,
        operation: exception.operation,
        severity: exception.severity,
        code: exception.code,
        message: exception.message,
      }),
    );

    return new GraphQLError(exception.message, {
      extensions: {
        traceId,
        code: exception.code,
        module: exception.module,
        operation: exception.operation,
        severity: exception.severity,
      },
    });
  }
}
