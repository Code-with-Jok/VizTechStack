import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConvexService } from '../../../../common/convex/convex.service';
import type {
  Article,
  CreateArticleInput,
  UpdateArticleInput,
} from '../../domain/models/article.model';

/**
 * ArticleService - Application service for article CRUD operations
 *
 * This service provides business logic for managing articles, including:
 * - Querying articles (findAll, findAllForAdmin, findBySlug)
 * - Creating new articles with duplicate slug validation
 * - Updating existing articles with existence validation
 * - Soft deleting articles (setting isDeleted=true)
 *
 * All operations include comprehensive error logging for debugging and security auditing.
 *
 * Requirements: 2.6, 2.7, 2.8, 2.9, 2.10, 10.7, 10.8
 */
@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);

  constructor(private readonly convexService: ConvexService) {}

  /**
   * Find all published articles
   *
   * Returns all articles that have isPublished=true and isDeleted=false,
   * ordered by createdAt descending.
   * This is a public operation accessible to all users (Guest, User, Admin).
   *
   * @returns Promise<Article[]> Array of published articles
   * @throws InternalServerErrorException if Convex query fails
   *
   * Requirements: 2.6, 2.10
   */
  async findAll(): Promise<Article[]> {
    this.logger.log('Fetching all published articles');

    try {
      const articles =
        await this.convexService.query<Article[]>('articles:list');

      if (!articles) {
        this.logger.log('No articles found (null/undefined response)');
        return [];
      }

      if (!Array.isArray(articles)) {
        this.logger.warn(
          'Convex returned non-array response for articles:list',
        );
        return [];
      }

      this.logger.log(`Successfully fetched ${articles.length} articles`);
      return articles;
    } catch (error) {
      this.logger.error(
        'Failed to fetch articles',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to fetch articles');
    }
  }

  /**
   * Find all articles including drafts and deleted (admin only)
   *
   * Returns all articles regardless of publication status or deletion status,
   * ordered by updatedAt descending.
   * This is an admin-only operation used for the admin dashboard.
   *
   * @returns Promise<Article[]> Array of all articles (published, drafts, and deleted)
   * @throws InternalServerErrorException if Convex query fails
   *
   * Requirements: 2.6, 10.8
   */
  async findAllForAdmin(): Promise<Article[]> {
    this.logger.log(
      'Fetching all articles for admin (including drafts and deleted)',
    );

    try {
      const articles =
        await this.convexService.query<Article[]>('articles:listAll');

      if (!articles) {
        this.logger.log('No articles found (null/undefined response)');
        return [];
      }

      if (!Array.isArray(articles)) {
        this.logger.warn(
          'Convex returned non-array response for articles:listAll',
        );
        return [];
      }

      this.logger.log(
        `Successfully fetched ${articles.length} articles for admin`,
      );
      return articles;
    } catch (error) {
      this.logger.error(
        'Failed to fetch articles for admin',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Failed to fetch articles for admin',
      );
    }
  }

  /**
   * Find an article by its slug
   *
   * Returns a single article matching the provided slug, or null if not found.
   * Only returns published and non-deleted articles for public access.
   * This is a public operation accessible to all users (Guest, User, Admin).
   *
   * @param slug - URL-friendly identifier for the article
   * @returns Promise<Article | null> The article if found, null otherwise
   * @throws InternalServerErrorException if Convex query fails
   *
   * Requirements: 2.6, 2.7, 8.1
   */
  async findBySlug(slug: string): Promise<Article | null> {
    this.logger.log(`Fetching article by slug: ${slug}`);

    try {
      const article = await this.convexService.query<Article | null>(
        'articles:getBySlug',
        { slug },
      );

      if (article) {
        this.logger.log(`Successfully fetched article: ${slug}`);
      } else {
        this.logger.log(`Article not found: ${slug}`);
      }

      return article;
    } catch (error) {
      this.logger.error(
        `Failed to fetch article by slug: ${slug}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to fetch article');
    }
  }

  /**
   * Create a new article
   *
   * Creates a new article with the provided input data and author ID.
   * Validates that the slug is unique before creating.
   * Calculates reading time and word count from content.
   * Only accessible to Admin users (enforced by resolver guards).
   *
   * @param input - CreateArticleInput containing article data
   * @param authorId - Clerk user ID of the creator (extracted from JWT)
   * @returns Promise<Article> The created article with full data
   * @throws ConflictException if slug already exists
   * @throws InternalServerErrorException if Convex mutation fails
   *
   * Requirements: 2.6, 2.7, 2.10, 10.7
   */
  async create(input: CreateArticleInput, authorId: string): Promise<Article> {
    this.logger.log(`Creating article: ${input.slug} by user: ${authorId}`);

    try {
      // Validate: Check for duplicate slug
      const existing = await this.findBySlug(input.slug);
      if (existing) {
        this.logger.warn(`Duplicate slug detected: ${input.slug}`);
        throw new ConflictException(
          `Article với slug "${input.slug}" đã tồn tại`,
        );
      }

      // Calculate reading time and word count
      const wordCount = this.calculateWordCount(input.content);
      const readingTime = this.calculateReadingTime(wordCount);

      // Generate timestamps
      const now = Date.now();

      // Create article in Convex
      const articleId = await this.convexService.mutation<string>(
        'articles:create',
        {
          ...input,
          author: authorId,
          createdAt: now,
          updatedAt: now,
          isDeleted: false,
          readingTime,
          wordCount,
        },
      );

      this.logger.log(
        `Successfully created article: ${articleId} with slug: ${input.slug}`,
      );

      // Fetch and return the created article
      const createdArticle = await this.findBySlug(input.slug);
      if (!createdArticle) {
        throw new InternalServerErrorException(
          'Failed to fetch created article',
        );
      }

      return createdArticle;
    } catch (error) {
      // Re-throw ConflictException as-is
      if (error instanceof ConflictException) {
        throw error;
      }

      // Log and wrap other errors
      this.logger.error(
        `Failed to create article: ${input.slug}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to create article');
    }
  }

  /**
   * Update an existing article
   *
   * Updates an article with the provided input data.
   * Validates that the article exists before updating.
   * If slug is being changed, validates that the new slug is unique.
   * Recalculates reading time and word count if content is updated.
   * Updates the updatedAt timestamp.
   * Only accessible to Admin users (enforced by resolver guards).
   *
   * @param input - UpdateArticleInput containing article ID and fields to update
   * @returns Promise<Article> The updated article with full data
   * @throws NotFoundException if article with given ID does not exist
   * @throws ConflictException if new slug already exists
   * @throws InternalServerErrorException if Convex mutation fails
   *
   * Requirements: 2.8, 2.9, 10.7
   */
  async update(input: UpdateArticleInput): Promise<Article> {
    this.logger.log(`Updating article: ${input.id}`);

    try {
      // Validate: If slug is being changed, check for duplicates
      if (input.slug) {
        const existing = await this.findBySlug(input.slug);
        if (existing && existing._id !== input.id) {
          this.logger.warn(
            `Duplicate slug detected during update: ${input.slug}`,
          );
          throw new ConflictException(
            `Article với slug "${input.slug}" đã tồn tại`,
          );
        }
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {
        ...input,
        updatedAt: Date.now(),
      };

      // Recalculate reading time and word count if content is updated
      if (input.content) {
        const wordCount = this.calculateWordCount(input.content);
        const readingTime = this.calculateReadingTime(wordCount);
        updateData.readingTime = readingTime;
        updateData.wordCount = wordCount;
      }

      // Update article in Convex
      await this.convexService.mutation<string>('articles:update', updateData);

      this.logger.log(`Successfully updated article: ${input.id}`);

      // Fetch and return the updated article
      // If slug was updated, use the new slug, otherwise fetch by ID
      const updatedArticle = input.slug
        ? await this.findBySlug(input.slug)
        : await this.findById(input.id);

      if (!updatedArticle) {
        throw new NotFoundException(
          `Không tìm thấy article với ID: ${input.id}`,
        );
      }

      return updatedArticle;
    } catch (error) {
      // Re-throw known exceptions as-is
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // Check if error is due to non-existent ID (Convex will throw an error)
      if (
        error instanceof Error &&
        error.message.includes('Document not found')
      ) {
        this.logger.warn(`Article not found for update: ${input.id}`);
        throw new NotFoundException(
          `Không tìm thấy article với ID: ${input.id}`,
        );
      }

      // Log and wrap other errors
      this.logger.error(
        `Failed to update article: ${input.id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to update article');
    }
  }

  /**
   * Soft delete an article
   *
   * Marks an article as deleted by setting isDeleted=true.
   * The article remains in the database but is excluded from public queries.
   * Validates that the article exists before deleting.
   * Only accessible to Admin users (enforced by resolver guards).
   *
   * @param id - Unique identifier of the article to delete
   * @returns Promise<Article> The deleted article with full data
   * @throws NotFoundException if article with given ID does not exist
   * @throws InternalServerErrorException if Convex mutation fails
   *
   * Requirements: 2.9, 10.8
   */
  async delete(id: string): Promise<Article> {
    this.logger.log(`Soft deleting article: ${id}`);

    try {
      // Fetch article before deleting to return it
      const article = await this.findById(id);
      if (!article) {
        this.logger.warn(`Article not found for deletion: ${id}`);
        throw new NotFoundException(`Không tìm thấy article với ID: ${id}`);
      }

      // Soft delete article in Convex (set isDeleted=true)
      await this.convexService.mutation<string>('articles:softDelete', { id });

      this.logger.log(`Successfully soft deleted article: ${id}`);

      // Return the article with isDeleted=true
      return {
        ...article,
        isDeleted: true,
        updatedAt: Date.now(),
      };
    } catch (error) {
      // Re-throw NotFoundException as-is
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Check if error is due to non-existent ID (Convex will throw an error)
      if (
        error instanceof Error &&
        error.message.includes('Document not found')
      ) {
        this.logger.warn(`Article not found for deletion: ${id}`);
        throw new NotFoundException(`Không tìm thấy article với ID: ${id}`);
      }

      // Log and wrap other errors
      this.logger.error(
        `Failed to delete article: ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to delete article');
    }
  }

  /**
   * Find an article by its ID
   *
   * Helper method to fetch an article by its Convex document ID.
   *
   * @param id - Convex document ID
   * @returns Promise<Article | null> The article if found, null otherwise
   */
  private async findById(id: string): Promise<Article | null> {
    try {
      // Use findAllForAdmin to get all articles (including drafts and deleted) for admin operations
      const articles = await this.findAllForAdmin();
      return articles.find((a) => a._id === id) || null;
    } catch (error) {
      this.logger.error(
        `Failed to fetch article by ID: ${id}`,
        error instanceof Error ? error.stack : error,
      );
      return null;
    }
  }

  /**
   * Calculate word count from content
   *
   * Counts words in the content string by splitting on whitespace.
   * Handles HTML content by stripping tags first.
   *
   * @param content - Article content (may contain HTML)
   * @returns number Word count
   */
  private calculateWordCount(content: string): number {
    // Strip HTML tags
    const textContent = content.replace(/<[^>]*>/g, ' ');

    // Split on whitespace and filter empty strings
    const words = textContent
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    return words.length;
  }

  /**
   * Calculate reading time from word count
   *
   * Estimates reading time based on average reading speed of 200 words per minute.
   * Returns time in minutes, rounded up to nearest minute.
   *
   * @param wordCount - Number of words in the article
   * @returns number Reading time in minutes
   *
   * Requirements: 8.4
   */
  private calculateReadingTime(wordCount: number): number {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);

    // Minimum 1 minute reading time
    return Math.max(1, minutes);
  }
}
