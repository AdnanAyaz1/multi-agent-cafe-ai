import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '../errors';
import { logger } from '../logger';
import type { ResponseType, ErrorResponseBody, FormattedError, MongoDuplicateKeyError } from './types';

export type { ResponseType };

const log = logger.child('api:errors');

const formatResponse = (
  responseType: ResponseType,
  status: number,
  message: string,
  code: string,
  details?: unknown
): NextResponse | FormattedError => {
  const body: ErrorResponseBody = {
    error: message,
    code,
    ...(details !== undefined ? { details } : {}),
  };

  if (responseType === 'api') {
    return NextResponse.json(body, { status });
  }
  return { status, body };
};

const handleError = (
  error: unknown,
  responseType: ResponseType = 'api'
): NextResponse | FormattedError => {
  if (error instanceof AppError) {
    return formatResponse(
      responseType,
      error.statusCode,
      error.message,
      error.code,
      error.details
    );
  }

  if (error instanceof ZodError) {
    return formatResponse(
      responseType,
      400,
      'Validation failed',
      'VALIDATION_ERROR',
      error.flatten()
    );
  }

  if (error instanceof Error) {
    const message = error.message || 'An unexpected error occurred';
    const status = 500;
    const code = 'INTERNAL_ERROR';

    if (error.name === 'CastError') {
      const id = error.message.split(' ')[6]?.replace(/[^a-zA-Z0-9]/g, '') ?? '';
      return formatResponse(
        responseType,
        400,
        `Invalid ID: ${id}`,
        'INVALID_ID'
      );
    }

    if ((error as MongoDuplicateKeyError).code === 11000) {
      const duplicateKey = Object.keys((error as MongoDuplicateKeyError).keyValue).join(', ');
      return formatResponse(
        responseType,
        409,
        `${duplicateKey} already exists`,
        'DUPLICATE_KEY'
      );
    }

    log.error('unhandled error', error);
    return formatResponse(responseType, status, message, code);
  }

  log.error('unknown error', error);
  return formatResponse(responseType, 500, 'An unexpected error occurred', 'UNKNOWN_ERROR');
};

export default handleError;
