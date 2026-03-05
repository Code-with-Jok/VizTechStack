import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';

export interface GraphQLContext {
  req: {
    user?: {
      id: string;
      role?: string;
      [key: string]: any;
    };
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext<GraphQLContext>();
    const user = gqlContext.req?.user;

    this.logger.debug('RolesGuard Check Started', {
      requiredRoles,
      userRole: user?.role,
    });

    if (!user || !user.role) {
      this.logger.debug('Access Denied: No role found');
      throw new ForbiddenException('Access denied: No role assigned');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      this.logger.debug(
        `Access Denied: User role ${user.role} not in ${requiredRoles}`,
      );
      throw new ForbiddenException(
        `Access denied: Requires ${requiredRoles.join(' or ')} permission`,
      );
    }

    this.logger.debug('Access Granted');
    return true;
  }
}
