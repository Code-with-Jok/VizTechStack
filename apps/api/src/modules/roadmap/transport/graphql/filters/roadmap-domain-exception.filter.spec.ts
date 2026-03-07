import { ArgumentsHost } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { RoadmapDomainExceptionFilter } from './roadmap-domain-exception.filter';
import {
  RoadmapValidationDomainError,
  RoadmapAuthorizationDomainError,
  RoadmapNotFoundDomainError,
  RoadmapDuplicateDomainError,
  RoadmapParsingDomainError,
  RoadmapInfrastructureDomainError,
} from '../../../domain/errors/roadmap-domain-error';

describe('RoadmapDomainExceptionFilter', () => {
  let filter: RoadmapDomainExceptionFilter;
  let mockHost: ArgumentsHost;
  let mockGqlHost: GqlArgumentsHost;

  beforeEach(() => {
    filter = new RoadmapDomainExceptionFilter();

    mockGqlHost = {
      getContext: jest.fn().mockReturnValue({}),
    } as unknown as GqlArgumentsHost;

    mockHost = {
      switchToHttp: jest.fn(),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as unknown as ArgumentsHost;

    jest.spyOn(GqlArgumentsHost, 'create').mockReturnValue(mockGqlHost);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Status Code Mapping', () => {
    it('should map RoadmapValidationDomainError to 400 Bad Request', () => {
      const exception = new RoadmapValidationDomainError(
        'Invalid input',
        'createRoadmap',
      );

      const result = filter.catch(exception, mockHost);

      expect(result).toBeInstanceOf(GraphQLError);
      expect(result.extensions?.statusCode).toBe(400);
      expect(result.extensions?.code).toBe('ROADMAP_VALIDATION_ERROR');
      expect(result.message).toBe('Invalid input');
    });

    it('should map RoadmapAuthorizationDomainError to 403 Forbidden', () => {
      const exception = new RoadmapAuthorizationDomainError(
        'Unauthorized access',
        'createRoadmap',
      );

      const result = filter.catch(exception, mockHost);

      expect(result).toBeInstanceOf(GraphQLError);
      expect(result.extensions?.statusCode).toBe(403);
      expect(result.extensions?.code).toBe('ROADMAP_AUTHORIZATION_ERROR');
      // High severity errors should return generic message
      expect(result.message).toBe(
        'An internal error occurred. Please try again later.',
      );
    });

    it('should map RoadmapNotFoundDomainError to 404 Not Found', () => {
      const exception = new RoadmapNotFoundDomainError(
        'Roadmap not found',
        'getRoadmapBySlug',
      );

      const result = filter.catch(exception, mockHost);

      expect(result).toBeInstanceOf(GraphQLError);
      expect(result.extensions?.statusCode).toBe(404);
      expect(result.extensions?.code).toBe('ROADMAP_NOT_FOUND_ERROR');
      expect(result.message).toBe('Roadmap not found');
    });

    it('should map RoadmapDuplicateDomainError to 409 Conflict', () => {
      const exception = new RoadmapDuplicateDomainError(
        'Roadmap already exists',
        'createRoadmap',
      );

      const result = filter.catch(exception, mockHost);

      expect(result).toBeInstanceOf(GraphQLError);
      expect(result.extensions?.statusCode).toBe(409);
      expect(result.extensions?.code).toBe('ROADMAP_DUPLICATE_ERROR');
      expect(result.message).toBe('Roadmap already exists');
    });

    it('should map RoadmapParsingDomainError to 422 Unprocessable Entity', () => {
      const exception = new RoadmapParsingDomainError(
        'Invalid JSON format',
        'parseNodesJson',
      );

      const result = filter.catch(exception, mockHost);

      expect(result).toBeInstanceOf(GraphQLError);
      expect(result.extensions?.statusCode).toBe(422);
      expect(result.extensions?.code).toBe('ROADMAP_PARSING_ERROR');
      expect(result.message).toBe('Invalid JSON format');
    });

    it('should map RoadmapInfrastructureDomainError to 500 Internal Server Error', () => {
      const exception = new RoadmapInfrastructureDomainError(
        'Database connection failed',
        'createRoadmap',
      );

      const result = filter.catch(exception, mockHost);

      expect(result).toBeInstanceOf(GraphQLError);
      expect(result.extensions?.statusCode).toBe(500);
      expect(result.extensions?.code).toBe('ROADMAP_INFRASTRUCTURE_ERROR');
      // High severity errors should return generic message
      expect(result.message).toBe(
        'An internal error occurred. Please try again later.',
      );
    });
  });

  describe('Error Message Handling', () => {
    it('should pass through low severity error messages', () => {
      const exception = new RoadmapValidationDomainError(
        'Specific validation error',
        'createRoadmap',
      );

      const result = filter.catch(exception, mockHost);

      expect(result.message).toBe('Specific validation error');
    });

    it('should mask high severity error messages', () => {
      const exception = new RoadmapAuthorizationDomainError(
        'Sensitive authorization details',
        'createRoadmap',
      );

      const result = filter.catch(exception, mockHost);

      expect(result.message).toBe(
        'An internal error occurred. Please try again later.',
      );
      expect(result.message).not.toContain('Sensitive authorization details');
    });
  });

  describe('Error Extensions', () => {
    it('should include traceId in extensions', () => {
      const exception = new RoadmapValidationDomainError(
        'Test error',
        'testOperation',
      );

      const result = filter.catch(exception, mockHost);

      expect(result.extensions?.traceId).toBeDefined();
      expect(typeof result.extensions?.traceId).toBe('string');
    });

    it('should include error code in extensions', () => {
      const exception = new RoadmapDuplicateDomainError(
        'Duplicate slug',
        'createRoadmap',
      );

      const result = filter.catch(exception, mockHost);

      expect(result.extensions?.code).toBe('ROADMAP_DUPLICATE_ERROR');
    });

    it('should include statusCode in extensions', () => {
      const exception = new RoadmapNotFoundDomainError(
        'Not found',
        'getRoadmap',
      );

      const result = filter.catch(exception, mockHost);

      expect(result.extensions?.statusCode).toBe(404);
    });
  });
});
