import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

/**
 * RoadmapDocsController - REST-style documentation for GraphQL operations
 *
 * This controller provides Swagger/OpenAPI documentation for GraphQL operations.
 * It does NOT implement actual REST endpoints - all operations go through /graphql.
 *
 * Purpose: Display GraphQL operations in Swagger UI for better discoverability
 */
@ApiTags('graphql')
@Controller('docs/graphql')
export class RoadmapDocsController {
  /**
   * GraphQL Query: roadmaps
   *
   * Get all published roadmaps
   */
  @Get('roadmaps')
  @ApiOperation({
    summary: '[GraphQL Query] Get all published roadmaps',
    description:
      'Public endpoint accessible to all users.\n\n' +
      '**GraphQL Query:**\n```graphql\nquery {\n  roadmaps {\n    id\n    slug\n    title\n    description\n    content\n    author\n    tags\n    publishedAt\n    updatedAt\n    isPublished\n  }\n}\n```\n\n' +
      '**Access:** Public (no authentication required)\n\n' +
      '**Use GraphQL Playground at /graphql to execute this query**',
  })
  @ApiResponse({
    status: 200,
    description: 'List of published roadmaps',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            roadmaps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'roadmap_123' },
                  slug: { type: 'string', example: 'frontend-developer' },
                  title: {
                    type: 'string',
                    example: 'Frontend Developer Roadmap',
                  },
                  description: {
                    type: 'string',
                    example: 'Complete guide to becoming a frontend developer',
                  },
                  content: {
                    type: 'string',
                    example: '# Frontend Developer...',
                  },
                  author: { type: 'string', example: 'user_456' },
                  tags: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['frontend', 'javascript', 'react'],
                  },
                  publishedAt: { type: 'number', example: 1704067200000 },
                  updatedAt: { type: 'number', example: 1704067200000 },
                  isPublished: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
      },
    },
  })
  getRoadmaps() {
    return {
      message:
        'This is a documentation endpoint. Use GraphQL Playground at /graphql to execute queries.',
    };
  }

  /**
   * GraphQL Query: roadmapsForAdmin
   *
   * Get all roadmaps including drafts (admin only)
   */
  @Get('admin/roadmaps')
  @ApiOperation({
    summary: '[GraphQL Query] Get all roadmaps for admin (including drafts)',
    description:
      'Admin-only endpoint that returns all roadmaps regardless of publication status.\n\n' +
      '**GraphQL Query:**\n```graphql\nquery GetRoadmapsForAdmin {\n  roadmapsForAdmin {\n    id\n    slug\n    title\n    description\n    content\n    author\n    tags\n    publishedAt\n    updatedAt\n    isPublished\n  }\n}\n```\n\n' +
      '**Access:** Admin only (requires valid JWT token and admin role)\n\n' +
      '**Authorization:** Bearer JWT token required\n\n' +
      '**Role:** admin\n\n' +
      'This endpoint is used by the admin dashboard to manage both published and draft roadmaps.',
  })
  @ApiTags('roadmap')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all roadmaps for admin',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            roadmapsForAdmin: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'roadmap_123' },
                  slug: { type: 'string', example: 'frontend-developer' },
                  title: {
                    type: 'string',
                    example: 'Frontend Developer Roadmap',
                  },
                  description: {
                    type: 'string',
                    example: 'Complete guide to becoming a frontend developer',
                  },
                  content: {
                    type: 'string',
                    example: '# Frontend Developer Roadmap\n\nThis roadmap...',
                  },
                  author: { type: 'string', example: 'user_456' },
                  tags: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['frontend', 'javascript', 'react'],
                  },
                  publishedAt: { type: 'number', example: 1704067200000 },
                  updatedAt: { type: 'number', example: 1704067200000 },
                  isPublished: { type: 'boolean', example: false },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Unauthorized' },
              extensions: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'UNAUTHENTICATED' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have admin role',
    schema: {
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Forbidden resource' },
              extensions: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'FORBIDDEN' },
                },
              },
            },
          },
        },
      },
    },
  })
  getRoadmapsForAdmin() {
    return {
      message:
        'This is a documentation endpoint. Use GraphQL Playground at /graphql to execute queries.',
    };
  }

  /**
   * GraphQL Query: roadmap
   *
   * Get a single roadmap by slug
   */
  @Get('roadmap/:slug')
  @ApiOperation({
    summary: '[GraphQL Query] Get roadmap by slug',
    description:
      'Public endpoint accessible to all users.\n\n' +
      '**GraphQL Query:**\n```graphql\nquery GetRoadmap($slug: String!) {\n  roadmap(slug: $slug) {\n    id\n    slug\n    title\n    description\n    content\n    author\n    tags\n    publishedAt\n    updatedAt\n    isPublished\n  }\n}\n```\n\n' +
      '**Variables:**\n```json\n{\n  "slug": "frontend-developer"\n}\n```\n\n' +
      '**Access:** Public (no authentication required)\n\n' +
      '**Use GraphQL Playground at /graphql to execute this query**',
  })
  @ApiParam({
    name: 'slug',
    description: 'URL-friendly identifier for the roadmap',
    example: 'frontend-developer',
  })
  @ApiResponse({
    status: 200,
    description: 'Roadmap details',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            roadmap: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'roadmap_123' },
                slug: { type: 'string', example: 'frontend-developer' },
                title: {
                  type: 'string',
                  example: 'Frontend Developer Roadmap',
                },
                description: {
                  type: 'string',
                  example: 'Complete guide to becoming a frontend developer',
                },
                content: { type: 'string', example: '# Frontend Developer...' },
                author: { type: 'string', example: 'user_456' },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['frontend', 'javascript', 'react'],
                },
                publishedAt: { type: 'number', example: 1704067200000 },
                updatedAt: { type: 'number', example: 1704067200000 },
                isPublished: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Roadmap not found',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            roadmap: { type: 'null', example: null },
          },
        },
      },
    },
  })
  getRoadmap(@Param('slug') slug: string) {
    return {
      message:
        'This is a documentation endpoint. Use GraphQL Playground at /graphql to execute queries.',
      slug,
    };
  }

  /**
   * GraphQL Mutation: createRoadmap
   *
   * Create a new roadmap (Admin only)
   */
  @Post('roadmap')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '[GraphQL Mutation] Create a new roadmap',
    description:
      'Admin-only mutation. Creates a new roadmap.\n\n' +
      '**GraphQL Mutation:**\n```graphql\nmutation CreateRoadmap($input: CreateRoadmapInput!) {\n  createRoadmap(input: $input) {\n    id\n    slug\n    title\n    description\n    content\n    author\n    tags\n    publishedAt\n    updatedAt\n    isPublished\n  }\n}\n```\n\n' +
      '**Variables:**\n```json\n{\n  "input": {\n    "slug": "backend-developer",\n    "title": "Backend Developer Roadmap",\n    "description": "Complete guide to becoming a backend developer",\n    "content": "# Backend Developer Roadmap\\n\\n...",\n    "tags": ["backend", "nodejs", "database"],\n    "isPublished": true\n  }\n}\n```\n\n' +
      '**Access:** Admin only (requires authentication with admin role)\n\n' +
      '**Authentication:** Include JWT token in Authorization header:\n```\nAuthorization: Bearer <your-jwt-token>\n```\n\n' +
      '**Use GraphQL Playground at /graphql to execute this mutation**',
  })
  @ApiBody({
    description: 'CreateRoadmapInput',
    schema: {
      type: 'object',
      required: [
        'slug',
        'title',
        'description',
        'content',
        'tags',
        'isPublished',
      ],
      properties: {
        slug: {
          type: 'string',
          description: 'URL-friendly identifier (must be unique)',
          example: 'backend-developer',
        },
        title: {
          type: 'string',
          description: 'Roadmap title',
          example: 'Backend Developer Roadmap',
        },
        description: {
          type: 'string',
          description: 'Short description',
          example: 'Complete guide to becoming a backend developer',
        },
        content: {
          type: 'string',
          description: 'Markdown content',
          example: '# Backend Developer Roadmap\n\n## Introduction\n\n...',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for categorization',
          example: ['backend', 'nodejs', 'database'],
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
    status: 200,
    description: 'Roadmap created successfully - Returns full roadmap object',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            createRoadmap: {
              type: 'object',
              description: 'The created roadmap with full data',
              properties: {
                id: { type: 'string', example: 'roadmap_789' },
                slug: { type: 'string', example: 'backend-developer' },
                title: {
                  type: 'string',
                  example: 'Backend Developer Roadmap',
                },
                description: {
                  type: 'string',
                  example: 'Complete guide to becoming a backend developer',
                },
                content: {
                  type: 'string',
                  example: '# Backend Developer Roadmap\n\n...',
                },
                author: { type: 'string', example: 'user_456' },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['backend', 'nodejs', 'database'],
                },
                publishedAt: { type: 'number', example: 1704067200000 },
                updatedAt: { type: 'number', example: 1704067200000 },
                isPublished: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Duplicate slug',
    schema: {
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Roadmap với slug "backend-developer" đã tồn tại',
              },
              extensions: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'BAD_REQUEST' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
    schema: {
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Missing or malformed Authorization header',
              },
              extensions: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'UNAUTHENTICATED' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    schema: {
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Insufficient permissions',
              },
              extensions: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'FORBIDDEN' },
                },
              },
            },
          },
        },
      },
    },
  })
  createRoadmap(@Body() input: unknown) {
    return {
      message:
        'This is a documentation endpoint. Use GraphQL Playground at /graphql to execute mutations.',
      input,
    };
  }

  /**
   * GraphQL Mutation: updateRoadmap
   *
   * Update an existing roadmap (Admin only)
   */
  @Post('roadmap/update')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '[GraphQL Mutation] Update an existing roadmap',
    description:
      'Admin-only mutation. Updates a roadmap (partial update).\n\n' +
      '**GraphQL Mutation:**\n```graphql\nmutation UpdateRoadmap($input: UpdateRoadmapInput!) {\n  updateRoadmap(input: $input) {\n    id\n    slug\n    title\n    description\n    content\n    author\n    tags\n    publishedAt\n    updatedAt\n    isPublished\n  }\n}\n```\n\n' +
      '**Variables:**\n```json\n{\n  "input": {\n    "id": "roadmap_789",\n    "title": "Updated Backend Developer Roadmap",\n    "description": "Updated description"\n  }\n}\n```\n\n' +
      '**Access:** Admin only (requires authentication with admin role)\n\n' +
      '**Authentication:** Include JWT token in Authorization header:\n```\nAuthorization: Bearer <your-jwt-token>\n```\n\n' +
      '**Use GraphQL Playground at /graphql to execute this mutation**',
  })
  @ApiBody({
    description: 'UpdateRoadmapInput',
    schema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'string',
          description: 'Roadmap ID (required)',
          example: 'roadmap_789',
        },
        slug: {
          type: 'string',
          description: 'New slug (optional)',
          example: 'backend-developer-2024',
        },
        title: {
          type: 'string',
          description: 'New title (optional)',
          example: 'Updated Backend Developer Roadmap',
        },
        description: {
          type: 'string',
          description: 'New description (optional)',
          example: 'Updated description',
        },
        content: {
          type: 'string',
          description: 'New content (optional)',
          example: '# Updated Backend Developer Roadmap\n\n...',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'New tags (optional)',
          example: ['backend', 'nodejs', 'typescript'],
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
    description: 'Roadmap updated successfully - Returns full roadmap object',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            updateRoadmap: {
              type: 'object',
              description: 'The updated roadmap with full data',
              properties: {
                id: { type: 'string', example: 'roadmap_789' },
                slug: { type: 'string', example: 'backend-developer-2024' },
                title: {
                  type: 'string',
                  example: 'Updated Backend Developer Roadmap',
                },
                description: {
                  type: 'string',
                  example: 'Updated description',
                },
                content: {
                  type: 'string',
                  example: '# Updated Backend Developer Roadmap\n\n...',
                },
                author: { type: 'string', example: 'user_456' },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['backend', 'nodejs', 'typescript'],
                },
                publishedAt: { type: 'number', example: 1704067200000 },
                updatedAt: { type: 'number', example: 1704153600000 },
                isPublished: { type: 'boolean', example: false },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Duplicate slug',
    schema: {
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Roadmap với slug "backend-developer-2024" đã tồn tại',
              },
              extensions: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'BAD_REQUEST' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
    schema: {
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Missing or malformed Authorization header',
              },
              extensions: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'UNAUTHENTICATED' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    schema: {
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Insufficient permissions',
              },
              extensions: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'FORBIDDEN' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Roadmap does not exist',
    schema: {
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Không tìm thấy roadmap với ID: roadmap_789',
              },
              extensions: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'NOT_FOUND' },
                },
              },
            },
          },
        },
      },
    },
  })
  updateRoadmap(@Body() input: unknown) {
    return {
      message:
        'This is a documentation endpoint. Use GraphQL Playground at /graphql to execute mutations.',
      input,
    };
  }

  /**
   * GraphQL Mutation: deleteRoadmap
   *
   * Delete a roadmap (Admin only)
   */
  @Post('roadmap/delete/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '[GraphQL Mutation] Delete a roadmap',
    description:
      'Admin-only mutation. Deletes a roadmap.\n\n' +
      '**GraphQL Mutation:**\n```graphql\nmutation DeleteRoadmap($id: String!) {\n  deleteRoadmap(id: $id) {\n    id\n    slug\n    title\n    description\n    content\n    author\n    tags\n    publishedAt\n    updatedAt\n    isPublished\n  }\n}\n```\n\n' +
      '**Variables:**\n```json\n{\n  "id": "roadmap_789"\n}\n```\n\n' +
      '**Access:** Admin only (requires authentication with admin role)\n\n' +
      '**Authentication:** Include JWT token in Authorization header:\n```\nAuthorization: Bearer <your-jwt-token>\n```\n\n' +
      '**Use GraphQL Playground at /graphql to execute this mutation**',
  })
  @ApiParam({
    name: 'id',
    description: 'Roadmap ID to delete',
    example: 'roadmap_789',
  })
  @ApiResponse({
    status: 200,
    description: 'Roadmap deleted successfully - Returns full roadmap object',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            deleteRoadmap: {
              type: 'object',
              description: 'The deleted roadmap with full data',
              properties: {
                id: { type: 'string', example: 'roadmap_789' },
                slug: { type: 'string', example: 'backend-developer' },
                title: {
                  type: 'string',
                  example: 'Backend Developer Roadmap',
                },
                description: {
                  type: 'string',
                  example: 'Complete guide to becoming a backend developer',
                },
                content: {
                  type: 'string',
                  example: '# Backend Developer Roadmap\n\n...',
                },
                author: { type: 'string', example: 'user_456' },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['backend', 'nodejs', 'database'],
                },
                publishedAt: { type: 'number', example: 1704067200000 },
                updatedAt: { type: 'number', example: 1704067200000 },
                isPublished: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
    schema: {
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Missing or malformed Authorization header',
              },
              extensions: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'UNAUTHENTICATED' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    schema: {
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Insufficient permissions',
              },
              extensions: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'FORBIDDEN' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Roadmap does not exist',
    schema: {
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Không tìm thấy roadmap với ID: roadmap_789',
              },
              extensions: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'NOT_FOUND' },
                },
              },
            },
          },
        },
      },
    },
  })
  deleteRoadmap(@Param('id') id: string) {
    return {
      message:
        'This is a documentation endpoint. Use GraphQL Playground at /graphql to execute mutations.',
      id,
    };
  }
}
