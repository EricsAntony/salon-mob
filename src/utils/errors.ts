export class AppError extends Error {
  type?: string; // preferred semantic identifier (e.g., USER_NOT_REGISTERED)
  code?: number; // numeric error code from server
  status?: number;
  constructor(message: string, type?: string, status?: number, code?: number) {
    super(message);
    this.type = type;
    this.code = code;
    this.status = status;
  }
}

export type ApiErrorShape = {
  success?: boolean;
  error?: { error_type?: string; type?: string; code?: number; message?: string } | null;
  errors?: { type?: string; code?: number; message?: string } | null;
};

export function fromApiError(data: ApiErrorShape | null, status?: number): AppError {
  const type = data?.error?.error_type || data?.error?.type || data?.errors?.type;
  const numericCode = data?.error?.code ?? data?.errors?.code;
  const message = data?.error?.message || data?.errors?.message || 'Something went wrong';
  return new AppError(message, type, status, numericCode);
}
