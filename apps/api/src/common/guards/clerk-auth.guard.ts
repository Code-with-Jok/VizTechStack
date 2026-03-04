import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { verifyToken } from '@clerk/backend';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly secretKey = process.env.CLERK_SECRET_KEY || '';

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const gqlReq = ctx.getContext().req;

    // Check for Authorization header
    const authHeader = gqlReq?.headers?.authorization as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return true;
    }

    const token = authHeader.split(' ')[1];
    try {
      const sessionClaims = await verifyToken(token, {
        secretKey: this.secretKey,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      gqlReq.user = {
        ...sessionClaims,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        role: (sessionClaims as any).metadata?.role || 'user',
      };

      return true;
    } catch (err) {
      console.error('Clerk Auth Error:', err);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
