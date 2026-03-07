import { RoadmapInputPolicy } from './roadmap-input.policy';
import {
  RoadmapValidationDomainError,
  RoadmapParsingDomainError,
} from '../errors/roadmap-domain-error';

describe('RoadmapInputPolicy', () => {
  let policy: RoadmapInputPolicy;

  beforeEach(() => {
    policy = new RoadmapInputPolicy();
  });

  describe('validateSlug', () => {
    it('should accept valid kebab-case slugs', () => {
      expect(() => policy.validateSlug('frontend-developer')).not.toThrow();
      expect(() => policy.validateSlug('react-basics')).not.toThrow();
      expect(() => policy.validateSlug('web-dev-2024')).not.toThrow();
      expect(() => policy.validateSlug('a')).not.toThrow();
      expect(() => policy.validateSlug('a-b-c-d-e')).not.toThrow();
    });

    it('should reject empty or whitespace-only slugs', () => {
      expect(() => policy.validateSlug('')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateSlug('   ')).toThrow(
        RoadmapValidationDomainError,
      );
    });

    it('should reject slugs with uppercase letters', () => {
      expect(() => policy.validateSlug('Frontend-Developer')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateSlug('REACT')).toThrow(
        RoadmapValidationDomainError,
      );
    });

    it('should reject slugs with special characters', () => {
      expect(() => policy.validateSlug('frontend_developer')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateSlug('frontend developer')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateSlug('frontend.developer')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateSlug('frontend/developer')).toThrow(
        RoadmapValidationDomainError,
      );
    });

    it('should reject slugs starting or ending with hyphens', () => {
      expect(() => policy.validateSlug('-frontend')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateSlug('frontend-')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateSlug('-frontend-')).toThrow(
        RoadmapValidationDomainError,
      );
    });

    it('should reject slugs with consecutive hyphens', () => {
      expect(() => policy.validateSlug('frontend--developer')).toThrow(
        RoadmapValidationDomainError,
      );
    });
  });

  describe('validateGraphData', () => {
    it('should accept valid JSON arrays for nodes and edges', () => {
      expect(() => policy.validateGraphData('[]', '[]')).not.toThrow();
      expect(() =>
        policy.validateGraphData(
          '[{"id":"1","type":"default"}]',
          '[{"id":"e1","source":"1","target":"2"}]',
        ),
      ).not.toThrow();
    });

    it('should accept empty arrays', () => {
      expect(() => policy.validateGraphData('[]', '[]')).not.toThrow();
    });

    it('should throw RoadmapParsingDomainError for invalid nodesJson', () => {
      expect(() => policy.validateGraphData('invalid json', '[]')).toThrow(
        RoadmapParsingDomainError,
      );
      expect(() => policy.validateGraphData('{not an array}', '[]')).toThrow(
        RoadmapParsingDomainError,
      );
      expect(() => policy.validateGraphData('', '[]')).toThrow(
        RoadmapParsingDomainError,
      );
    });

    it('should throw RoadmapParsingDomainError for invalid edgesJson', () => {
      expect(() => policy.validateGraphData('[]', 'invalid json')).toThrow(
        RoadmapParsingDomainError,
      );
      expect(() => policy.validateGraphData('[]', '{not an array}')).toThrow(
        RoadmapParsingDomainError,
      );
      expect(() => policy.validateGraphData('[]', '')).toThrow(
        RoadmapParsingDomainError,
      );
    });

    it('should throw RoadmapValidationDomainError if nodesJson is not an array', () => {
      expect(() => policy.validateGraphData('{}', '[]')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateGraphData('"string"', '[]')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateGraphData('123', '[]')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateGraphData('null', '[]')).toThrow(
        RoadmapValidationDomainError,
      );
    });

    it('should throw RoadmapValidationDomainError if edgesJson is not an array', () => {
      expect(() => policy.validateGraphData('[]', '{}')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateGraphData('[]', '"string"')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateGraphData('[]', '123')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateGraphData('[]', 'null')).toThrow(
        RoadmapValidationDomainError,
      );
    });

    it('should include descriptive error messages', () => {
      try {
        policy.validateGraphData('invalid', '[]');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapParsingDomainError);
        expect((error as Error).message).toContain('Failed to parse nodesJson');
      }

      try {
        policy.validateGraphData('[]', 'invalid');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapParsingDomainError);
        expect((error as Error).message).toContain('Failed to parse edgesJson');
      }
    });
  });

  describe('validateCategory', () => {
    it('should accept valid category values', () => {
      expect(() => policy.validateCategory('role')).not.toThrow();
      expect(() => policy.validateCategory('skill')).not.toThrow();
      expect(() => policy.validateCategory('best-practice')).not.toThrow();
    });

    it('should reject invalid category values', () => {
      expect(() => policy.validateCategory('invalid')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateCategory('Role')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateCategory('SKILL')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateCategory('')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateCategory('best_practice')).toThrow(
        RoadmapValidationDomainError,
      );
    });

    it('should include valid values in error message', () => {
      try {
        policy.validateCategory('invalid');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapValidationDomainError);
        expect((error as Error).message).toContain('role');
        expect((error as Error).message).toContain('skill');
        expect((error as Error).message).toContain('best-practice');
      }
    });
  });

  describe('validateDifficulty', () => {
    it('should accept valid difficulty values', () => {
      expect(() => policy.validateDifficulty('beginner')).not.toThrow();
      expect(() => policy.validateDifficulty('intermediate')).not.toThrow();
      expect(() => policy.validateDifficulty('advanced')).not.toThrow();
    });

    it('should reject invalid difficulty values', () => {
      expect(() => policy.validateDifficulty('invalid')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateDifficulty('Beginner')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateDifficulty('ADVANCED')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateDifficulty('')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateDifficulty('easy')).toThrow(
        RoadmapValidationDomainError,
      );
    });

    it('should include valid values in error message', () => {
      try {
        policy.validateDifficulty('invalid');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapValidationDomainError);
        expect((error as Error).message).toContain('beginner');
        expect((error as Error).message).toContain('intermediate');
        expect((error as Error).message).toContain('advanced');
      }
    });
  });

  describe('validateStatus', () => {
    it('should accept valid status values', () => {
      expect(() => policy.validateStatus('public')).not.toThrow();
      expect(() => policy.validateStatus('draft')).not.toThrow();
      expect(() => policy.validateStatus('private')).not.toThrow();
    });

    it('should reject invalid status values', () => {
      expect(() => policy.validateStatus('invalid')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateStatus('Public')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateStatus('DRAFT')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateStatus('')).toThrow(
        RoadmapValidationDomainError,
      );
      expect(() => policy.validateStatus('published')).toThrow(
        RoadmapValidationDomainError,
      );
    });

    it('should include valid values in error message', () => {
      try {
        policy.validateStatus('invalid');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RoadmapValidationDomainError);
        expect((error as Error).message).toContain('public');
        expect((error as Error).message).toContain('draft');
        expect((error as Error).message).toContain('private');
      }
    });
  });

  describe('error properties', () => {
    it('should set correct operation name in errors', () => {
      try {
        policy.validateSlug('');
      } catch (error) {
        expect((error as RoadmapValidationDomainError).operation).toBe(
          'validateSlug',
        );
      }

      try {
        policy.validateGraphData('invalid', '[]');
      } catch (error) {
        expect((error as RoadmapParsingDomainError).operation).toBe(
          'validateGraphData',
        );
      }

      try {
        policy.validateCategory('invalid');
      } catch (error) {
        expect((error as RoadmapValidationDomainError).operation).toBe(
          'validateCategory',
        );
      }

      try {
        policy.validateDifficulty('invalid');
      } catch (error) {
        expect((error as RoadmapValidationDomainError).operation).toBe(
          'validateDifficulty',
        );
      }

      try {
        policy.validateStatus('invalid');
      } catch (error) {
        expect((error as RoadmapValidationDomainError).operation).toBe(
          'validateStatus',
        );
      }
    });
  });
});
