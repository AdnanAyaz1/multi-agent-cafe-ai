export type ResponseType = 'api' | 'server';

export interface ErrorResponseBody {
  error: string;
  code: string;
  details?: unknown;
}

export interface FormattedError {
  status: number;
  body: ErrorResponseBody;
}

export interface MongoDuplicateKeyError extends Error {
  code: number;
  keyValue: Record<string, unknown>;
}
