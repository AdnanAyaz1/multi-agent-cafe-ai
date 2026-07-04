export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UpstreamError extends AppError {
  constructor(message: string, service?: string) {
    super(
      message,
      502,
      'UPSTREAM_ERROR',
      service ? { service } : undefined
    );
  }
}

export class AgentError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, 'AGENT_ERROR', details);
  }
}
