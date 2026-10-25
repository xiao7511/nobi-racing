export class ApiError extends Error {
  constructor(public code: string, public traceId?: string, public retryAfter?: number) { super(code); }
}
