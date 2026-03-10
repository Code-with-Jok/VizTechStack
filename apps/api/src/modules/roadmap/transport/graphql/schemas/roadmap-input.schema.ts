import { InputType, Field } from '@nestjs/graphql';

/**
 * GraphQL input type for creating a new roadmap
 *
 * This input schema is used in the createRoadmap mutation.
 * All fields are required except for the author which is extracted
 * from the authenticated user context.
 *
 * Requirements: 7.2 - Admin can create roadmaps
 */
@InputType()
export class CreateRoadmapInput {
  /**
   * URL-friendly identifier for the roadmap
   * Must be unique across all roadmaps
   */
  @Field()
  slug!: string;

  /**
   * Display title of the roadmap
   * Main heading shown to users
   */
  @Field()
  title!: string;

  /**
   * Short description of the roadmap
   * Summary text for previews and listings
   */
  @Field()
  description!: string;

  /**
   * Full markdown content of the roadmap
   * Complete roadmap content in markdown format
   */
  @Field()
  content!: string;

  /**
   * Category tags for organizing roadmaps
   * Array of strings for categorization and filtering
   */
  @Field(() => [String])
  tags!: string[];

  /**
   * Publication status flag
   * Determines if the roadmap is visible to public users
   */
  @Field()
  isPublished!: boolean;
}

/**
 * GraphQL input type for updating an existing roadmap
 *
 * This input schema is used in the updateRoadmap mutation.
 * Only the id field is required; all other fields are optional
 * to support partial updates.
 *
 * Requirements: 7.4 - Admin can update roadmaps
 */
@InputType()
export class UpdateRoadmapInput {
  /**
   * Unique identifier of the roadmap to update
   * Must reference an existing roadmap
   */
  @Field()
  id!: string;

  /**
   * URL-friendly identifier for the roadmap
   * Optional - only update if provided
   */
  @Field({ nullable: true })
  slug?: string;

  /**
   * Display title of the roadmap
   * Optional - only update if provided
   */
  @Field({ nullable: true })
  title?: string;

  /**
   * Short description of the roadmap
   * Optional - only update if provided
   */
  @Field({ nullable: true })
  description?: string;

  /**
   * Full markdown content of the roadmap
   * Optional - only update if provided
   */
  @Field({ nullable: true })
  content?: string;

  /**
   * Category tags for organizing roadmaps
   * Optional - only update if provided
   */
  @Field(() => [String], { nullable: true })
  tags?: string[];

  /**
   * Publication status flag
   * Optional - only update if provided
   */
  @Field({ nullable: true })
  isPublished?: boolean;
}
