export type RoadmapErrorCode =
  | 'ROADMAP_VALIDATION_ERROR'
  | 'ROADMAP_AUTHORIZATION_ERROR'
  | 'ROADMAP_INFRASTRUCTURE_ERROR';

export type RoadmapErrorSeverity = 'low' | 'medium' | 'high';

interface RoadmapDomainErrorOptions {
  code: RoadmapErrorCode;
  message: string;
  operation: string;
  severity: RoadmapErrorSeverity;
}

export class RoadmapDomainError extends Error {
  readonly code: RoadmapErrorCode;
  readonly module = 'roadmap';
  readonly operation: string;
  readonly severity: RoadmapErrorSeverity;

  constructor(options: RoadmapDomainErrorOptions) {
    super(options.message);
    this.name = 'RoadmapDomainError';
    this.code = options.code;
    this.operation = options.operation;
    this.severity = options.severity;
  }
}

export class RoadmapValidationDomainError extends RoadmapDomainError {
  constructor(message: string, operation: string) {
    super({
      code: 'ROADMAP_VALIDATION_ERROR',
      message,
      operation,
      severity: 'low',
    });
    this.name = 'RoadmapValidationDomainError';
  }
}

export class RoadmapAuthorizationDomainError extends RoadmapDomainError {
  constructor(message: string, operation: string) {
    super({
      code: 'ROADMAP_AUTHORIZATION_ERROR',
      message,
      operation,
      severity: 'high',
    });
    this.name = 'RoadmapAuthorizationDomainError';
  }
}

export class RoadmapInfrastructureDomainError extends RoadmapDomainError {
  constructor(message: string, operation: string) {
    super({
      code: 'ROADMAP_INFRASTRUCTURE_ERROR',
      message,
      operation,
      severity: 'high',
    });
    this.name = 'RoadmapInfrastructureDomainError';
  }
}
