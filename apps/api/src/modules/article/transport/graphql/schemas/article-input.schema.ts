import { InputType, Field } from '@nestjs/graphql';

/**
 * GraphQL input type for creating a new article
 *
 * This input schema is used in the createArticle mutation.
 * All fields are required except for the author which is extracted
 * from the authenticated user context.
 *
 * Requirements: 2.6, 2.7, 9.3
 */
@InputType()
export class CreateArticleInput {
  /**
   * URL-friendly identifier for the article
   * Must be unique across all articles
   * Format: lowercase alphanumeric with hyphens only
   */
  @Field()
  slug!: string;

  /**
   * Display title of the article
   * Main heading shown to users
   * Length: 1-200 characters
   */
  @Field()
  title!: string;

  /**
   * Full rich-text content of the article
   * Complete article content in HTML/JSON format from Tiptap editor
   */
  @Field()
  content!: string;

  /**
   * Category tags for organizing articles
   * Array of strings for categorization and filtering
   */
  @Field(() => [String])
  tags!: string[];

  /**
   * Publication status flag
   * Determines if the article is visible to public users
   */
  @Field()
  isPublished!: boolean;
}

/**
 * GraphQL input type for updating an existing article
 *
 * This input schema is used in the updateArticle mutation.
 * Only the id field is required; all other fields are optional
 * to support partial updates.
 *
 * Requirements: 2.8, 2.9, 9.3
 */
@InputType()
export class UpdateArticleInput {
  /**
   * Unique identifier of the article to update
   * Must reference an existing article
   */
  @Field()
  id!: string;

  /**
   * URL-friendly identifier for the article
   * Optional - only update if provided
   * Format: lowercase alphanumeric with hyphens only
   */
  @Field({ nullable: true })
  slug?: string;

  /**
   * Display title of the article
   * Optional - only update if provided
   * Length: 1-200 characters
   */
  @Field({ nullable: true })
  title?: string;

  /**
   * Full rich-text content of the article
   * Optional - only update if provided
   */
  @Field({ nullable: true })
  content?: string;

  /**
   * Category tags for organizing articles
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
