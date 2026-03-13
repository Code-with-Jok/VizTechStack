import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ArticleService } from '../../../application/services/article.service';
import { ClerkAuthGuard } from '../../../../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../../../../common/guards/roles.guard';
import { Roles } from '../../../../../common/decorators/roles.decorator';
import { Public } from '../../../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../../../common/decorators/current-user.decorator';
import type {
  CreateArticleInput,
  UpdateArticleInput,
} from '../../../domain/models/article.model';

/**
 * ArticleController - REST API endpoints for article CRUD operations
 *
 * This controller provides REST API endpoints for article management with
 * role-based access control:
 *
 * Public Operations (Guest, User, Admin):
 * - GET /articles - Get all published articles
 * - GET /articles/:slug - Get single article by slug
 *
 * Admin-Only Operations:
 * - GET /articles/admin/all - Get all articles including drafts
 * - POST /articles - Create new article
 * - PUT /articles/:id - Update existing article
 * - DELETE /articles/:id - Soft delete article
 *
 * Requirements: 2.6, 2.7, 2.8, 2.9, 2.10, 9.1, 9.3, 9.5
 */
@ApiTags('articles')
@Controller('articles')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  /**
   * Get all published articles
   *
   * Public endpoint accessible to all users.
   * Returns all articles with isPublished=true and isDeleted=false.
   *
   * @returns Array of published articles
   */
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all published articles',
    description: `Public endpoint that returns all published and non-deleted articles

**GraphQL Query:**
\`\`\`graphql
query {
  articles {
    _id
    slug
    title
    content
    author
    tags
    createdAt
    updatedAt
    isPublished
    readingTime
    wordCount
  }
}
\`\`\`

**Access:** Public (no authentication required)

**Use GraphQL Playground at /graphql to execute this query**`,
  })
  @ApiResponse({
    status: 200,
    description: 'List of published articles',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'article_123' },
          slug: { type: 'string', example: 'getting-started-with-react' },
          title: { type: 'string', example: 'Getting Started with React' },
          content: {
            type: 'string',
            example: '<p>React is a JavaScript library...</p>',
          },
          author: { type: 'string', example: 'user_456' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            example: ['react', 'javascript'],
          },
          createdAt: { type: 'number', example: 1704067200000 },
          updatedAt: { type: 'number', example: 1704067200000 },
          isPublished: { type: 'boolean', example: true },
          isDeleted: { type: 'boolean', example: false },
          readingTime: { type: 'number', example: 5 },
          wordCount: { type: 'number', example: 1000 },
        },
      },
    },
  })
  async findAll() {
    return this.articleService.findAll();
  }

  /**
   * Get all articles including drafts (admin only)
   *
   * Admin-only endpoint that returns all articles regardless of publication or deletion status.
   *
   * @returns Array of all articles
   */
  @Get('admin/all')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all articles for admin (including drafts and deleted)',
    description: `Admin-only endpoint that returns all articles regardless of status

**GraphQL Query:**
\`\`\`graphql
query {
  articlesForAdmin {
    _id
    slug
    title
    content
    author
    tags
    createdAt
    updatedAt
    isPublished
    isDeleted
    readingTime
    wordCount
  }
}
\`\`\`

**Access:** Admin only (requires JWT token with admin role)

**Headers:**
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

**Use GraphQL Playground at /graphql to execute this query**`,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all articles',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'article_123' },
          slug: { type: 'string', example: 'draft-article' },
          title: { type: 'string', example: 'Draft Article' },
          content: { type: 'string', example: '<p>Draft content...</p>' },
          author: { type: 'string', example: 'user_456' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            example: ['draft'],
          },
          createdAt: { type: 'number', example: 1704067200000 },
          updatedAt: { type: 'number', example: 1704067200000 },
          isPublished: { type: 'boolean', example: false },
          isDeleted: { type: 'boolean', example: false },
          readingTime: { type: 'number', example: 3 },
          wordCount: { type: 'number', example: 600 },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have admin role',
  })
  async findAllForAdmin() {
    return this.articleService.findAllForAdmin();
  }

  /**
   * Get single article by slug
   *
   * Public endpoint accessible to all users.
   * Returns the article matching the provided slug.
   *
   * @param slug - URL-friendly identifier for the article
   * @returns Article details or null if not found
   */
  @Get(':slug')
  @Public()
  @ApiOperation({
    summary: 'Get article by slug',
    description: `Public endpoint that returns a single article by its slug

**GraphQL Query:**
\`\`\`graphql
query {
  article(slug: "getting-started-with-react") {
    _id
    slug
    title
    content
    author
    tags
    createdAt
    updatedAt
    isPublished
    readingTime
    wordCount
  }
}
\`\`\`

**Access:** Public (no authentication required)

**Use GraphQL Playground at /graphql to execute this query**`,
  })
  @ApiParam({
    name: 'slug',
    description: 'URL-friendly identifier for the article',
    example: 'getting-started-with-react',
  })
  @ApiResponse({
    status: 200,
    description: 'Article details',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: 'article_123' },
        slug: { type: 'string', example: 'getting-started-with-react' },
        title: { type: 'string', example: 'Getting Started with React' },
        content: {
          type: 'string',
          example: '<p>React is a JavaScript library...</p>',
        },
        author: { type: 'string', example: 'user_456' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['react', 'javascript'],
        },
        createdAt: { type: 'number', example: 1704067200000 },
        updatedAt: { type: 'number', example: 1704067200000 },
        isPublished: { type: 'boolean', example: true },
        isDeleted: { type: 'boolean', example: false },
        readingTime: { type: 'number', example: 5 },
        wordCount: { type: 'number', example: 1000 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example:
            'Không tìm thấy article với slug: getting-started-with-react',
        },
      },
    },
  })
  async findBySlug(@Param('slug') slug: string) {
    const article = await this.articleService.findBySlug(slug);
    if (!article) {
      return null;
    }
    return article;
  }

  /**
   * Create new article
   *
   * Admin-only endpoint. Creates a new article with the provided data.
   * The author field is automatically set to the authenticated user's ID.
   *
   * @param input - Article creation data
   * @param user - Current authenticated user
   * @returns Created article with full data
   */
  @Post()
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new article',
    description: `Admin-only endpoint to create a new article. Author is automatically set from JWT token.

**GraphQL Mutation:**
\`\`\`graphql
mutation {
  createArticle(input: {
    slug: "getting-started-with-react"
    title: "Getting Started with React"
    content: "<p>React is a JavaScript library...</p>"
    tags: ["react", "javascript", "tutorial"]
    isPublished: true
  }) {
    _id
    slug
    title
    content
    author
    tags
    createdAt
    updatedAt
    isPublished
    readingTime
    wordCount
  }
}
\`\`\`

**Access:** Admin only (requires JWT token with admin role)

**Headers:**
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

**Use GraphQL Playground at /graphql to execute this mutation**`,
  })
  @ApiBody({
    description: 'Article creation data',
    schema: {
      type: 'object',
      required: ['slug', 'title', 'content', 'tags', 'isPublished'],
      properties: {
        slug: {
          type: 'string',
          description:
            'URL-friendly identifier (must be unique, lowercase, hyphens only)',
          example: 'getting-started-with-react',
        },
        title: {
          type: 'string',
          description: 'Article title (1-200 characters)',
          example: 'Getting Started with React',
        },
        content: {
          type: 'string',
          description: 'Article content in HTML/JSON format',
          example:
            '<p>React is a JavaScript library for building user interfaces...</p>',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for categorization',
          example: ['react', 'javascript', 'tutorial'],
        },
        isPublished: {
          type: 'boolean',
          description: 'Publication status',
          example: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Article created successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: 'article_789' },
        slug: { type: 'string', example: 'getting-started-with-react' },
        title: { type: 'string', example: 'Getting Started with React' },
        content: {
          type: 'string',
          example: '<p>React is a JavaScript library...</p>',
        },
        author: { type: 'string', example: 'user_456' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['react', 'javascript'],
        },
        createdAt: { type: 'number', example: 1704067200000 },
        updatedAt: { type: 'number', example: 1704067200000 },
        isPublished: { type: 'boolean', example: true },
        isDeleted: { type: 'boolean', example: false },
        readingTime: { type: 'number', example: 5 },
        wordCount: { type: 'number', example: 1000 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have admin role',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Duplicate slug',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: {
          type: 'string',
          example: 'Article với slug "getting-started-with-react" đã tồn tại',
        },
      },
    },
  })
  async create(
    @Body() input: CreateArticleInput,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.articleService.create(input, user.id);
  }

  /**
   * Update existing article
   *
   * Admin-only endpoint. Updates an article with the provided data.
   * Only the fields provided will be updated (partial update).
   *
   * @param id - Article ID
   * @param input - Article update data
   * @returns Updated article with full data
   */
  @Put(':id')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update existing article',
    description: `Admin-only endpoint to update an article. Only provided fields will be updated.

**GraphQL Mutation:**
\`\`\`graphql
mutation {
  updateArticle(input: {
    id: "article_789"
    slug: "react-getting-started-guide"
    title: "React: A Complete Getting Started Guide"
    content: "<p>Updated content...</p>"
    tags: ["react", "javascript", "beginner"]
    isPublished: false
  }) {
    _id
    slug
    title
    content
    author
    tags
    createdAt
    updatedAt
    isPublished
    readingTime
    wordCount
  }
}
\`\`\`

**Access:** Admin only (requires JWT token with admin role)

**Headers:**
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

**Use GraphQL Playground at /graphql to execute this mutation**`,
  })
  @ApiParam({
    name: 'id',
    description: 'Article ID',
    example: 'article_789',
  })
  @ApiBody({
    description: 'Article update data (all fields optional except id)',
    schema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'New slug (optional)',
          example: 'react-getting-started-guide',
        },
        title: {
          type: 'string',
          description: 'New title (optional)',
          example: 'React: A Complete Getting Started Guide',
        },
        content: {
          type: 'string',
          description: 'New content (optional)',
          example: '<p>Updated content...</p>',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'New tags (optional)',
          example: ['react', 'javascript', 'beginner'],
        },
        isPublished: {
          type: 'boolean',
          description: 'New publication status (optional)',
          example: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Article updated successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: 'article_789' },
        slug: { type: 'string', example: 'react-getting-started-guide' },
        title: {
          type: 'string',
          example: 'React: A Complete Getting Started Guide',
        },
        content: { type: 'string', example: '<p>Updated content...</p>' },
        author: { type: 'string', example: 'user_456' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['react', 'javascript', 'beginner'],
        },
        createdAt: { type: 'number', example: 1704067200000 },
        updatedAt: { type: 'number', example: 1704153600000 },
        isPublished: { type: 'boolean', example: false },
        isDeleted: { type: 'boolean', example: false },
        readingTime: { type: 'number', example: 7 },
        wordCount: { type: 'number', example: 1400 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have admin role',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Article does not exist',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Duplicate slug',
  })
  async update(
    @Param('id') id: string,
    @Body() input: Omit<UpdateArticleInput, 'id'>,
  ) {
    return this.articleService.update({ id, ...input });
  }

  /**
   * Soft delete article
   *
   * Admin-only endpoint. Marks an article as deleted (soft delete).
   * The article remains in the database but is excluded from public queries.
   *
   * @param id - Article ID
   * @returns Deleted article with full data
   */
  @Delete(':id')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft delete article',
    description: `Admin-only endpoint to soft delete an article. Article is marked as deleted but not removed from database.

**GraphQL Mutation:**
\`\`\`graphql
mutation {
  deleteArticle(id: "article_789") {
    _id
    slug
    title
    content
    author
    tags
    createdAt
    updatedAt
    isPublished
    isDeleted
    readingTime
    wordCount
  }
}
\`\`\`

**Access:** Admin only (requires JWT token with admin role)

**Headers:**
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

**Use GraphQL Playground at /graphql to execute this mutation**`,
  })
  @ApiParam({
    name: 'id',
    description: 'Article ID to delete',
    example: 'article_789',
  })
  @ApiResponse({
    status: 200,
    description: 'Article deleted successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: 'article_789' },
        slug: { type: 'string', example: 'getting-started-with-react' },
        title: { type: 'string', example: 'Getting Started with React' },
        content: {
          type: 'string',
          example: '<p>React is a JavaScript library...</p>',
        },
        author: { type: 'string', example: 'user_456' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['react', 'javascript'],
        },
        createdAt: { type: 'number', example: 1704067200000 },
        updatedAt: { type: 'number', example: 1704153600000 },
        isPublished: { type: 'boolean', example: true },
        isDeleted: { type: 'boolean', example: true },
        readingTime: { type: 'number', example: 5 },
        wordCount: { type: 'number', example: 1000 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have admin role',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Article does not exist',
  })
  async delete(@Param('id') id: string) {
    return this.articleService.delete(id);
  }
}
