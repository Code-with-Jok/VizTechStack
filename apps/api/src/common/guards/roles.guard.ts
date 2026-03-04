import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user = ctx.getContext().req?.user;

    console.log('--- RolesGuard Check ---');
    console.log('Required Roles:', requiredRoles);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log('User Role:', user?.role);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!user || !user.role) {
      console.log('Access Denied: No role found');
      throw new ForbiddenException('Access denied: No role assigned');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      console.log(
        `Access Denied: User role ${user.role} not in ${requiredRoles}`,
      );
      throw new ForbiddenException(
        `Access denied: Requires ${requiredRoles.join(' or ')} permission`,
      );
    }

    console.log('Access Granted');
    return true;
  }
}
