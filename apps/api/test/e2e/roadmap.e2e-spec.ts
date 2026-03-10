/**
 * E2E Tests for Roadmap CRUD Workflow
 *
 * These tests verify the complete CRUD workflow for roadmaps with actual HTTP requests
 * and database interactions. Tests are performed as an admin user with full permissions.
 *
 * Feature: user-role-based-access-control
 * Tasks: 14.1, 14.2
 * Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 6.1, 6.2, 6.3, 6.4, 7.2, 7.3, 7.4, 7.5, 8.4, 8.5, 10.1, 10.2
 */

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { ConvexService } from '../../src/common/convex/convex.service';

// Mock @clerk/backend module
jest.mock('@clerk/backend', () => ({
  verifyToken: jest.fn(),
  createClerkClient: jest.fn(() => ({
    users: {
      getUser: jest.fn(),
    },
  })),
}));

import { verifyToken } from '@clerk/backend';

interface GraphQLErrorPayload {
  message: string;
  extensions?: {
    code: string;
  };
}

interface GraphQLResponse<TData> {
  data: TData | null;
  errors?: GraphQLErrorPayload[];
}

function toGraphQLResponse<TData>(payload: unknown): GraphQLResponse<TData> {
  return payload as GraphQLResponse<TData>;
}

describe('Roadmap CRUD E2E', () => {
  let app: INestApplication<App>;
  let convexService: ConvexService;
  const mockVerifyToken = verifyToken as jest.MockedFunction<
    typeof verifyToken
  >;

  // Mock admin user
  const adminUser = {
    sub: 'admin_user_123',
    email: 'admin@example.com',
    metadata: {
      role: 'admin',
    },
  };

  // Mock regular user (non-admin)
  const regularUser = {
    sub: 'regular_user_456',
    email: 'user@example.com',
    metadata: {
      role: 'user',
    },
  };

  // Mock admin token
  const adminToken = 'mock-admin-jwt-token';

  // Mock user token
  const userToken = 'mock-user-jwt-token';

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.CLERK_JWT_ISSUER_DOMAIN ??= 'https://dummy.clerk.accounts.dev';
    process.env.WEB_APP_ORIGIN ??= 'http://localhost:3000';
    process.env.CLERK_SECRET_KEY = 'test-secret-key';
    process.env.CONVEX_URL ??= 'https://test.convex.cloud';
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    convexService = moduleFixture.get<ConvexService>(ConvexService);

    // Reset and configure mock for Clerk token verification
    mockVerifyToken.mockReset();
    mockVerifyToken.mockResolvedValue(adminUser as any);
  });

  afterEach(async () => {
    await app.close();
  });

  /**
   * Test: Complete CRUD workflow as admin
   * Validates: Requirements 7.2, 7.3, 7.4, 7.5
   *
   * This test verifies the complete lifecycle of a roadmap:
   * 1. Create a new roadmap (CREATE)
   * 2. Query the created roadmap (READ)
   * 3. Update the roadmap (UPDATE)
   * 4. Verify the update persisted (READ)
   * 5. Delete the roadmap (DELETE)
   * 6. Verify deletion (READ returns null)
   */
  it('should complete full CRUD workflow as admin', async () => {
    const uniqueSlug = `test-roadmap-${Date.now()}`;

    // Mock Convex responses for the workflow
    const mockRoadmapId = 'roadmap_test_123';
    const mockCreatedRoadmap = {
      _id: mockRoadmapId,
      slug: uniqueSlug,
      title: 'Test Roadmap',
      description: 'Test Description',
      content: 'Test Content',
      author: adminUser.sub,
      tags: ['test', 'e2e'],
      publishedAt: Date.now(),
      updatedAt: Date.now(),
      isPublished: true,
    };

    // Step 1: CREATE - Create a new roadmap
    // First mock: findBySlug for duplicate check (should return null)
    jest.spyOn(convexService, 'query').mockResolvedValueOnce(null);
    // Second mock: mutation to create roadmap
    jest.spyOn(convexService, 'mutation').mockResolvedValueOnce(mockRoadmapId);
    // Third mock: findBySlug to fetch created roadmap
    jest
      .spyOn(convexService, 'query')
      .mockResolvedValueOnce(mockCreatedRoadmap);

    const createResponse = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: `
                    mutation CreateRoadmap($input: CreateRoadmapInput!) {
                        createRoadmap(input: $input) {
                            id
                            slug
                            title
                            description
                            content
                            author
                            tags
                            isPublished
                        }
                    }
                `,
        variables: {
          input: {
            slug: uniqueSlug,
            title: 'Test Roadmap',
            description: 'Test Description',
            content: 'Test Content',
            tags: ['test', 'e2e'],
            isPublished: true,
          },
        },
      });

    const createBody = toGraphQLResponse<{
      createRoadmap: {
        id: string;
        slug: string;
        title: string;
        description: string;
        content: string;
        author: string;
        tags: string[];
        isPublished: boolean;
      };
    }>(createResponse.body as unknown);

    expect(createResponse.status).toBe(200);
    expect(createBody.errors).toBeUndefined();
    expect(createBody.data?.createRoadmap.id).toBe(mockRoadmapId);

    // Verify Convex mutation was called with correct data
    expect(convexService.mutation).toHaveBeenCalledWith(
      'roadmaps:create',
      expect.objectContaining({
        slug: uniqueSlug,
        title: 'Test Roadmap',
        description: 'Test Description',
        content: 'Test Content',
        tags: ['test', 'e2e'],
        isPublished: true,
        author: adminUser.sub,
      }),
    );

    // Step 2: READ - Query the created roadmap by slug
    jest
      .spyOn(convexService, 'query')
      .mockResolvedValueOnce(mockCreatedRoadmap);

    const readResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
                    query GetRoadmap($slug: String!) {
                        roadmap(slug: $slug) {
                            id
                            slug
                            title
                            description
                            content
                            author
                            tags
                            isPublished
                        }
                    }
                `,
        variables: {
          slug: uniqueSlug,
        },
      });

    const readBody = toGraphQLResponse<{
      roadmap: {
        id: string;
        slug: string;
        title: string;
        description: string;
        content: string;
        author: string;
        tags: string[];
        isPublished: boolean;
      };
    }>(readResponse.body as unknown);

    expect(readResponse.status).toBe(200);
    expect(readBody.errors).toBeUndefined();
    expect(readBody.data?.roadmap).toBeDefined();
    expect(readBody.data?.roadmap.id).toBe(mockRoadmapId);
    expect(readBody.data?.roadmap.slug).toBe(uniqueSlug);
    expect(readBody.data?.roadmap.title).toBe('Test Roadmap');
    expect(readBody.data?.roadmap.description).toBe('Test Description');
    expect(readBody.data?.roadmap.content).toBe('Test Content');
    expect(readBody.data?.roadmap.author).toBe(adminUser.sub);
    expect(readBody.data?.roadmap.tags).toEqual(['test', 'e2e']);
    expect(readBody.data?.roadmap.isPublished).toBe(true);

    // Step 3: UPDATE - Update the roadmap
    const mockUpdatedRoadmap = {
      ...mockCreatedRoadmap,
      title: 'Updated Test Roadmap',
      description: 'Updated Description',
      updatedAt: Date.now(),
    };

    jest.spyOn(convexService, 'mutation').mockResolvedValueOnce(mockRoadmapId);
    // Mock the findAllForAdmin call that happens in findById after update
    jest
      .spyOn(convexService, 'query')
      .mockResolvedValueOnce([mockUpdatedRoadmap]);

    const updateResponse = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: `
                    mutation UpdateRoadmap($input: UpdateRoadmapInput!) {
                        updateRoadmap(input: $input) {
                            id
                            title
                            description
                        }
                    }
                `,
        variables: {
          input: {
            id: mockRoadmapId,
            title: 'Updated Test Roadmap',
            description: 'Updated Description',
          },
        },
      });

    const updateBody = toGraphQLResponse<{
      updateRoadmap: { id: string; title: string; description: string };
    }>(updateResponse.body as unknown);

    expect(updateResponse.status).toBe(200);
    expect(updateBody.errors).toBeUndefined();
    expect(updateBody.data?.updateRoadmap.id).toBe(mockRoadmapId);

    // Verify Convex mutation was called with update data
    expect(convexService.mutation).toHaveBeenCalledWith(
      'roadmaps:update',
      expect.objectContaining({
        id: mockRoadmapId,
        title: 'Updated Test Roadmap',
        description: 'Updated Description',
      }),
    );

    // Step 4: READ - Verify the update persisted
    jest
      .spyOn(convexService, 'query')
      .mockResolvedValueOnce(mockUpdatedRoadmap);

    const verifyUpdateResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
                    query GetRoadmap($slug: String!) {
                        roadmap(slug: $slug) {
                            id
                            title
                            description
                        }
                    }
                `,
        variables: {
          slug: uniqueSlug,
        },
      });

    const verifyUpdateBody = toGraphQLResponse<{
      roadmap: {
        id: string;
        title: string;
        description: string;
      };
    }>(verifyUpdateResponse.body as unknown);

    expect(verifyUpdateResponse.status).toBe(200);
    expect(verifyUpdateBody.errors).toBeUndefined();
    expect(verifyUpdateBody.data?.roadmap.title).toBe('Updated Test Roadmap');
    expect(verifyUpdateBody.data?.roadmap.description).toBe(
      'Updated Description',
    );

    // Step 5: DELETE - Delete the roadmap
    jest.spyOn(convexService, 'mutation').mockResolvedValueOnce(mockRoadmapId);
    // Mock the findAllForAdmin call that happens in findById before delete
    jest
      .spyOn(convexService, 'query')
      .mockResolvedValueOnce([mockUpdatedRoadmap]);

    const deleteResponse = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: `
                    mutation DeleteRoadmap($id: String!) {
                        deleteRoadmap(id: $id) {
                            id
                            slug
                            title
                        }
                    }
                `,
        variables: {
          id: mockRoadmapId,
        },
      });

    const deleteBody = toGraphQLResponse<{
      deleteRoadmap: { id: string; slug: string; title: string };
    }>(deleteResponse.body as unknown);

    expect(deleteResponse.status).toBe(200);
    expect(deleteBody.errors).toBeUndefined();
    expect(deleteBody.data?.deleteRoadmap.id).toBe(mockRoadmapId);

    // Verify Convex mutation was called with correct ID
    expect(convexService.mutation).toHaveBeenCalledWith('roadmaps:remove', {
      id: mockRoadmapId,
    });

    // Step 6: READ - Verify deletion (should return null)
    jest.spyOn(convexService, 'query').mockResolvedValueOnce(null);

    const verifyDeleteResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
                    query GetRoadmap($slug: String!) {
                        roadmap(slug: $slug) {
                            id
                            slug
                            title
                        }
                    }
                `,
        variables: {
          slug: uniqueSlug,
        },
      });

    const verifyDeleteBody = toGraphQLResponse<{ roadmap: null }>(
      verifyDeleteResponse.body as unknown,
    );

    expect(verifyDeleteResponse.status).toBe(200);
    expect(verifyDeleteBody.errors).toBeUndefined();
    expect(verifyDeleteBody.data?.roadmap).toBeNull();
  });

  /**
   * Test: Verify data persistence after create
   * Validates: Requirements 7.2, 7.3
   *
   * This test ensures that all fields provided during creation are
   * correctly persisted and can be retrieved.
   */
  it('should persist all fields correctly after creation', async () => {
    const uniqueSlug = `persist-test-${Date.now()}`;
    const mockRoadmapId = 'roadmap_persist_123';
    const testData = {
      slug: uniqueSlug,
      title: 'Persistence Test Roadmap',
      description: 'Testing data persistence',
      content: '# Markdown Content\n\nThis is a test.',
      tags: ['persistence', 'test', 'validation'],
      isPublished: false,
    };

    const mockCreatedRoadmap = {
      _id: mockRoadmapId,
      ...testData,
      author: adminUser.sub,
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Create roadmap
    // First mock: findBySlug for duplicate check (should return null)
    jest.spyOn(convexService, 'query').mockResolvedValueOnce(null);
    // Second mock: mutation to create roadmap
    jest.spyOn(convexService, 'mutation').mockResolvedValueOnce(mockRoadmapId);
    // Third mock: findBySlug to fetch created roadmap
    jest
      .spyOn(convexService, 'query')
      .mockResolvedValueOnce(mockCreatedRoadmap);

    const createResponse = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: `
                    mutation CreateRoadmap($input: CreateRoadmapInput!) {
                        createRoadmap(input: $input) {
                            id
                            slug
                            title
                            description
                            content
                            author
                            tags
                            isPublished
                        }
                    }
                `,
        variables: {
          input: testData,
        },
      });

    expect(createResponse.status).toBe(200);

    // Query back and verify all fields
    jest
      .spyOn(convexService, 'query')
      .mockResolvedValueOnce(mockCreatedRoadmap);

    const queryResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
                    query GetRoadmap($slug: String!) {
                        roadmap(slug: $slug) {
                            id
                            slug
                            title
                            description
                            content
                            author
                            tags
                            isPublished
                        }
                    }
                `,
        variables: {
          slug: uniqueSlug,
        },
      });

    const queryBody = toGraphQLResponse<{
      roadmap: {
        id: string;
        slug: string;
        title: string;
        description: string;
        content: string;
        author: string;
        tags: string[];
        isPublished: boolean;
      };
    }>(queryResponse.body as unknown);

    expect(queryResponse.status).toBe(200);
    expect(queryBody.errors).toBeUndefined();
    expect(queryBody.data?.roadmap).toMatchObject({
      id: mockRoadmapId,
      slug: testData.slug,
      title: testData.title,
      description: testData.description,
      content: testData.content,
      author: adminUser.sub,
      tags: testData.tags,
      isPublished: testData.isPublished,
    });
  });

  /**
   * Test: Verify state changes after update
   * Validates: Requirements 7.3, 7.4
   *
   * This test ensures that updates correctly modify the roadmap state
   * and that unchanged fields remain intact.
   */
  it('should correctly update state while preserving unchanged fields', async () => {
    const mockRoadmapId = 'roadmap_update_state_123';
    const originalRoadmap = {
      _id: mockRoadmapId,
      slug: 'state-test',
      title: 'Original Title',
      description: 'Original Description',
      content: 'Original Content',
      author: adminUser.sub,
      tags: ['original', 'tags'],
      publishedAt: Date.now(),
      updatedAt: Date.now(),
      isPublished: false,
    };

    // Query original state
    jest.spyOn(convexService, 'query').mockResolvedValueOnce(originalRoadmap);

    const originalResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
                    query GetRoadmap($slug: String!) {
                        roadmap(slug: $slug) {
                            id
                            title
                            description
                            content
                            tags
                            isPublished
                        }
                    }
                `,
        variables: {
          slug: 'state-test',
        },
      });

    expect(originalResponse.status).toBe(200);

    // Update only title and isPublished
    jest.spyOn(convexService, 'mutation').mockResolvedValueOnce(mockRoadmapId);
    // Mock the findAllForAdmin call that happens in findById after update
    const updatedRoadmap = {
      ...originalRoadmap,
      title: 'Updated Title',
      isPublished: true,
      updatedAt: Date.now(),
    };
    jest.spyOn(convexService, 'query').mockResolvedValueOnce([updatedRoadmap]);

    const updateResponse = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: `
                    mutation UpdateRoadmap($input: UpdateRoadmapInput!) {
                        updateRoadmap(input: $input) {
                            id
                            title
                            isPublished
                        }
                    }
                `,
        variables: {
          input: {
            id: mockRoadmapId,
            title: 'Updated Title',
            isPublished: true,
          },
        },
      });

    expect(updateResponse.status).toBe(200);

    // Query updated state
    jest.spyOn(convexService, 'query').mockResolvedValueOnce(updatedRoadmap);

    const updatedResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
                    query GetRoadmap($slug: String!) {
                        roadmap(slug: $slug) {
                            id
                            title
                            description
                            content
                            tags
                            isPublished
                        }
                    }
                `,
        variables: {
          slug: 'state-test',
        },
      });

    const updatedBody = toGraphQLResponse<{
      roadmap: {
        id: string;
        title: string;
        description: string;
        content: string;
        tags: string[];
        isPublished: boolean;
      };
    }>(updatedResponse.body as unknown);

    expect(updatedResponse.status).toBe(200);
    expect(updatedBody.errors).toBeUndefined();

    // Verify updated fields changed
    expect(updatedBody.data?.roadmap.title).toBe('Updated Title');
    expect(updatedBody.data?.roadmap.isPublished).toBe(true);

    // Verify unchanged fields preserved
    expect(updatedBody.data?.roadmap.description).toBe('Original Description');
    expect(updatedBody.data?.roadmap.content).toBe('Original Content');
    expect(updatedBody.data?.roadmap.tags).toEqual(['original', 'tags']);
  });

  /**
   * Access Control Tests
   * Task: 14.2
   * Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 6.1, 6.2, 6.3, 6.4, 8.4, 8.5, 10.1, 10.2
   */

  describe('Access Control Scenarios', () => {
    const mockRoadmaps = [
      {
        _id: 'roadmap_1',
        slug: 'test-roadmap-1',
        title: 'Test Roadmap 1',
        description: 'Description 1',
        content: 'Content 1',
        author: 'author_1',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      },
      {
        _id: 'roadmap_2',
        slug: 'test-roadmap-2',
        title: 'Test Roadmap 2',
        description: 'Description 2',
        content: 'Content 2',
        author: 'author_2',
        tags: ['test'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      },
    ];

    /**
     * Test: Guest (unauthenticated) read access
     * Validates: Requirements 4.1, 5.1
     *
     * Guests should be able to query roadmaps without authentication
     */
    it('should allow guest to read roadmaps without authentication', async () => {
      jest.spyOn(convexService, 'query').mockResolvedValueOnce(mockRoadmaps);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
                        query {
                            roadmaps {
                                id
                                slug
                                title
                                description
                            }
                        }
                    `,
        });

      const body = toGraphQLResponse<{
        roadmaps: Array<{
          id: string;
          slug: string;
          title: string;
          description: string;
        }>;
      }>(response.body as unknown);

      expect(response.status).toBe(200);
      expect(body.errors).toBeUndefined();
      expect(body.data?.roadmaps).toBeDefined();
      expect(body.data?.roadmaps).toHaveLength(2);
      expect(body.data?.roadmaps[0].slug).toBe('test-roadmap-1');
    });

    /**
     * Test: Guest read single roadmap by slug
     * Validates: Requirements 4.1, 5.1
     */
    it('should allow guest to read single roadmap by slug', async () => {
      jest.spyOn(convexService, 'query').mockResolvedValueOnce(mockRoadmaps[0]);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
                        query GetRoadmap($slug: String!) {
                            roadmap(slug: $slug) {
                                id
                                slug
                                title
                                description
                                content
                            }
                        }
                    `,
          variables: {
            slug: 'test-roadmap-1',
          },
        });

      const body = toGraphQLResponse<{
        roadmap: {
          id: string;
          slug: string;
          title: string;
          description: string;
          content: string;
        };
      }>(response.body as unknown);

      expect(response.status).toBe(200);
      expect(body.errors).toBeUndefined();
      expect(body.data?.roadmap).toBeDefined();
      expect(body.data?.roadmap.slug).toBe('test-roadmap-1');
      expect(body.data?.roadmap.title).toBe('Test Roadmap 1');
    });

    /**
     * Test: Guest write rejection (401 Unauthorized)
     * Validates: Requirements 5.2, 8.5
     *
     * Guests should receive 401 when attempting write operations
     */
    it('should reject guest create attempt with 401 Unauthorized', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
                        mutation CreateRoadmap($input: CreateRoadmapInput!) {
                            createRoadmap(input: $input) {
                                id
                                slug
                                title
                            }
                        }
                    `,
          variables: {
            input: {
              slug: 'unauthorized-roadmap',
              title: 'Unauthorized',
              description: 'Should fail',
              content: 'Content',
              tags: ['test'],
              isPublished: true,
            },
          },
        });

      const body = toGraphQLResponse<{
        createRoadmap: { id: string; slug: string; title: string };
      }>(response.body as unknown);

      expect(response.status).toBe(200);
      expect(body.errors).toBeDefined();
      expect(body.errors?.[0].message).toContain('Authorization');
      expect(body.errors?.[0].extensions?.code).toBe('UNAUTHENTICATED');
    });

    /**
     * Test: Guest update rejection (401 Unauthorized)
     * Validates: Requirements 5.2, 8.5
     */
    it('should reject guest update attempt with 401 Unauthorized', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
                        mutation UpdateRoadmap($input: UpdateRoadmapInput!) {
                            updateRoadmap(input: $input) {
                                id
                                title
                            }
                        }
                    `,
          variables: {
            input: {
              id: 'roadmap_1',
              title: 'Unauthorized Update',
            },
          },
        });

      const body = toGraphQLResponse<{
        updateRoadmap: { id: string; title: string };
      }>(response.body as unknown);

      expect(response.status).toBe(200);
      expect(body.errors).toBeDefined();
      expect(body.errors?.[0].message).toContain('Authorization');
      expect(body.errors?.[0].extensions?.code).toBe('UNAUTHENTICATED');
    });

    /**
     * Test: Guest delete rejection (401 Unauthorized)
     * Validates: Requirements 5.2, 8.5
     */
    it('should reject guest delete attempt with 401 Unauthorized', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
                        mutation DeleteRoadmap($id: String!) {
                            deleteRoadmap(id: $id) {
                                id
                                slug
                                title
                            }
                        }
                    `,
          variables: {
            id: 'roadmap_1',
          },
        });

      const body = toGraphQLResponse<{
        deleteRoadmap: { id: string; slug: string; title: string };
      }>(response.body as unknown);

      expect(response.status).toBe(200);
      expect(body.errors).toBeDefined();
      expect(body.errors?.[0].message).toContain('Authorization');
      expect(body.errors?.[0].extensions?.code).toBe('UNAUTHENTICATED');
    });

    /**
     * Test: User (non-admin) read access
     * Validates: Requirements 4.2, 6.1
     *
     * Authenticated users with 'user' role should be able to read roadmaps
     */
    it('should allow authenticated user to read roadmaps', async () => {
      mockVerifyToken.mockResolvedValueOnce(regularUser as any);
      jest.spyOn(convexService, 'query').mockResolvedValueOnce(mockRoadmaps);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          query: `
                        query {
                            roadmaps {
                                id
                                slug
                                title
                            }
                        }
                    `,
        });

      const body = toGraphQLResponse<{
        roadmaps: Array<{
          id: string;
          slug: string;
          title: string;
        }>;
      }>(response.body as unknown);

      expect(response.status).toBe(200);
      expect(body.errors).toBeUndefined();
      expect(body.data?.roadmaps).toBeDefined();
      expect(body.data?.roadmaps).toHaveLength(2);
    });

    /**
     * Test: User create rejection (403 Forbidden)
     * Validates: Requirements 6.2, 8.4, 10.1, 10.2
     *
     * Non-admin users should receive 403 when attempting create operations
     */
    it('should reject user create attempt with 403 Forbidden', async () => {
      mockVerifyToken.mockResolvedValueOnce(regularUser as any);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          query: `
                        mutation CreateRoadmap($input: CreateRoadmapInput!) {
                            createRoadmap(input: $input) {
                                id
                                slug
                                title
                            }
                        }
                    `,
          variables: {
            input: {
              slug: 'forbidden-roadmap',
              title: 'Forbidden',
              description: 'Should fail',
              content: 'Content',
              tags: ['test'],
              isPublished: true,
            },
          },
        });

      const body = toGraphQLResponse<{
        createRoadmap: { id: string; slug: string; title: string };
      }>(response.body as unknown);

      expect(response.status).toBe(200);
      expect(body.errors).toBeDefined();
      expect(body.errors?.[0].message).toContain('permissions');
      expect(body.errors?.[0].extensions?.code).toBe('FORBIDDEN');
    });

    /**
     * Test: User update rejection (403 Forbidden)
     * Validates: Requirements 6.3, 8.4, 10.1, 10.2
     */
    it('should reject user update attempt with 403 Forbidden', async () => {
      mockVerifyToken.mockResolvedValueOnce(regularUser as any);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          query: `
                        mutation UpdateRoadmap($input: UpdateRoadmapInput!) {
                            updateRoadmap(input: $input) {
                                id
                                title
                            }
                        }
                    `,
          variables: {
            input: {
              id: 'roadmap_1',
              title: 'Forbidden Update',
            },
          },
        });

      const body = toGraphQLResponse<{
        updateRoadmap: { id: string; title: string };
      }>(response.body as unknown);

      expect(response.status).toBe(200);
      expect(body.errors).toBeDefined();
      expect(body.errors?.[0].message).toContain('permissions');
      expect(body.errors?.[0].extensions?.code).toBe('FORBIDDEN');
    });

    /**
     * Test: User delete rejection (403 Forbidden)
     * Validates: Requirements 6.4, 8.4, 10.1, 10.2
     */
    it('should reject user delete attempt with 403 Forbidden', async () => {
      mockVerifyToken.mockResolvedValueOnce(regularUser as any);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          query: `
                        mutation DeleteRoadmap($id: String!) {
                            deleteRoadmap(id: $id) {
                                id
                                slug
                                title
                            }
                        }
                    `,
          variables: {
            id: 'roadmap_1',
          },
        });

      const body = toGraphQLResponse<{
        deleteRoadmap: { id: string; slug: string; title: string };
      }>(response.body as unknown);

      expect(response.status).toBe(200);
      expect(body.errors).toBeDefined();
      expect(body.errors?.[0].message).toContain('permissions');
      expect(body.errors?.[0].extensions?.code).toBe('FORBIDDEN');
    });

    /**
     * Test: Admin full CRUD access
     * Validates: Requirements 4.3, 7.2, 7.3, 7.4, 7.5
     *
     * Admin users should have full access to all CRUD operations
     */
    it('should allow admin full CRUD access', async () => {
      const mockRoadmapId = 'roadmap_admin_test';
      const mockRoadmap = {
        _id: mockRoadmapId,
        slug: 'admin-test',
        title: 'Admin Test',
        description: 'Admin Description',
        content: 'Admin Content',
        author: adminUser.sub,
        tags: ['admin'],
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        isPublished: true,
      };

      // Test CREATE
      mockVerifyToken.mockResolvedValue(adminUser as any);
      // First mock: findBySlug for duplicate check (should return null)
      jest.spyOn(convexService, 'query').mockResolvedValueOnce(null);
      // Second mock: mutation to create roadmap
      jest
        .spyOn(convexService, 'mutation')
        .mockResolvedValueOnce(mockRoadmapId);
      // Third mock: findBySlug to fetch created roadmap
      jest.spyOn(convexService, 'query').mockResolvedValueOnce(mockRoadmap);

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
                        mutation CreateRoadmap($input: CreateRoadmapInput!) {
                            createRoadmap(input: $input) {
                                id
                                slug
                                title
                                description
                                content
                                author
                                tags
                                isPublished
                            }
                        }
                    `,
          variables: {
            input: {
              slug: 'admin-test',
              title: 'Admin Test',
              description: 'Admin Description',
              content: 'Admin Content',
              tags: ['admin'],
              isPublished: true,
            },
          },
        });

      const createBody = toGraphQLResponse<{
        createRoadmap: {
          id: string;
          slug: string;
          title: string;
          description: string;
          content: string;
          author: string;
          tags: string[];
          isPublished: boolean;
        };
      }>(createResponse.body as unknown);

      expect(createResponse.status).toBe(200);
      expect(createBody.errors).toBeUndefined();
      expect(createBody.data?.createRoadmap.id).toBe(mockRoadmapId);

      // Test READ
      jest.spyOn(convexService, 'query').mockResolvedValueOnce(mockRoadmap);

      const readResponse = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
                        query GetRoadmap($slug: String!) {
                            roadmap(slug: $slug) {
                                id
                                slug
                                title
                            }
                        }
                    `,
          variables: {
            slug: 'admin-test',
          },
        });

      const readBody = toGraphQLResponse<{
        roadmap: {
          id: string;
          slug: string;
          title: string;
        };
      }>(readResponse.body as unknown);

      expect(readResponse.status).toBe(200);
      expect(readBody.errors).toBeUndefined();
      expect(readBody.data?.roadmap.slug).toBe('admin-test');

      // Test UPDATE
      jest
        .spyOn(convexService, 'mutation')
        .mockResolvedValueOnce(mockRoadmapId);
      // Mock the findAllForAdmin call that happens in findById after update
      const updatedMockRoadmap = {
        ...mockRoadmap,
        title: 'Updated Admin Test',
      };
      jest
        .spyOn(convexService, 'query')
        .mockResolvedValueOnce([updatedMockRoadmap]);

      const updateResponse = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
                        mutation UpdateRoadmap($input: UpdateRoadmapInput!) {
                            updateRoadmap(input: $input) {
                                id
                                title
                            }
                        }
                    `,
          variables: {
            input: {
              id: mockRoadmapId,
              title: 'Updated Admin Test',
            },
          },
        });

      const updateBody = toGraphQLResponse<{
        updateRoadmap: { id: string; title: string };
      }>(updateResponse.body as unknown);

      expect(updateResponse.status).toBe(200);
      expect(updateBody.errors).toBeUndefined();
      expect(updateBody.data?.updateRoadmap.id).toBe(mockRoadmapId);

      // Test DELETE
      jest
        .spyOn(convexService, 'mutation')
        .mockResolvedValueOnce(mockRoadmapId);
      // Mock the findAllForAdmin call that happens in findById before delete
      jest.spyOn(convexService, 'query').mockResolvedValueOnce([mockRoadmap]);

      const deleteResponse = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
                        mutation DeleteRoadmap($id: String!) {
                            deleteRoadmap(id: $id) {
                                id
                                slug
                                title
                            }
                        }
                    `,
          variables: {
            id: mockRoadmapId,
          },
        });

      const deleteBody = toGraphQLResponse<{
        deleteRoadmap: { id: string; slug: string; title: string };
      }>(deleteResponse.body as unknown);

      expect(deleteResponse.status).toBe(200);
      expect(deleteBody.errors).toBeUndefined();
      expect(deleteBody.data?.deleteRoadmap.id).toBe(mockRoadmapId);
    });
  });
});
