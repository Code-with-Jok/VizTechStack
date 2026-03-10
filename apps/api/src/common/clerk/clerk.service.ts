import { Injectable, Logger } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';

interface ClerkUser {
  id: string;
  firstName?: string;
  lastName?: string;
  emailAddresses?: Array<{
    emailAddress: string;
  }>;
}

/**
 * ClerkService - Service for interacting with Clerk API
 *
 * This service provides methods to fetch user information from Clerk,
 * including user names for display purposes.
 */
@Injectable()
export class ClerkService {
  private readonly logger = new Logger(ClerkService.name);
  private readonly clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  /**
   * Get user information by Clerk user ID
   *
   * @param userId - Clerk user ID
   * @returns Promise<{ id: string; name: string } | null> User info or null if not found
   */
  async getUserById(
    userId: string,
  ): Promise<{ id: string; name: string } | null> {
    try {
      const user = await this.clerkClient.users.getUser(userId);

      // Construct display name from available fields
      const name = this.constructDisplayName(user as ClerkUser);

      return {
        id: user.id,
        name,
      };
    } catch (error) {
      this.logger.warn(`Failed to fetch user ${userId} from Clerk:`, error);
      return null;
    }
  }

  /**
   * Construct a display name from Clerk user data
   *
   * @param user - Clerk user object
   * @returns string - Display name
   */
  private constructDisplayName(user: ClerkUser): string {
    // Try different name combinations in order of preference
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    if (user.firstName) {
      return user.firstName;
    }

    if (user.lastName) {
      return user.lastName;
    }

    // Fallback to email username or full email
    if (user.emailAddresses && user.emailAddresses.length > 0) {
      const email = user.emailAddresses[0].emailAddress;
      const username = email.split('@')[0];
      return username;
    }

    // Final fallback to user ID
    return `User ${user.id.slice(-8)}`;
  }
}
