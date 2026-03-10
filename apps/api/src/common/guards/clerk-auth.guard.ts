import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { verifyToken } from '@clerk/backend';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface ClerkJwtPayload {
  sub?: string;
  metadata?: {
    role?: string;
  };
  public_metadata?: {
    role?: string;
  };
  role?: string;
  [key: string]: unknown;
}

interface RequestWithUser {
  headers?: {
    authorization?: string;
  };
  user?: ClerkJwtPayload & { role: string };
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);
  private readonly secretKey = process.env.CLERK_SECRET_KEY;
  private hasLoggedMissingSecret = false;

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    if (!this.secretKey) {
      if (!this.hasLoggedMissingSecret) {
        this.logger.error(
          'CLERK_SECRET_KEY is missing. Protected GraphQL operations are unavailable.',
        );
        this.hasLoggedMissingSecret = true;
      }
      throw new UnauthorizedException('Authentication is unavailable.');
    }

    const ctx = GqlExecutionContext.create(context);
    const gqlReq = ctx.getContext<{ req: RequestWithUser }>().req;

    // Check for Authorization header
    const authHeader = gqlReq.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or malformed Authorization header',
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const sessionClaims = (await verifyToken(token, {
        secretKey: this.secretKey,
      })) as unknown as ClerkJwtPayload;

      // Extract role from multiple possible locations in JWT
      const role =
        sessionClaims.role ||
        sessionClaims.metadata?.role ||
        sessionClaims.public_metadata?.role ||
        'user';

      gqlReq.user = {
        ...sessionClaims,
        id: sessionClaims.sub, // Map Clerk's 'sub' to 'id'
        role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
