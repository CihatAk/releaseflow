import { NextResponse } from 'next/server';

export class ApiResponse {
  static success<T>(data: T, status: number = 200, message?: string) {
    return NextResponse.json(
      {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }

  static error(message: string, status: number = 500, errors?: string[]) {
    return NextResponse.json(
      {
        success: false,
        error: message,
        errors,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }

  static validationError(errors: string[]) {
    return this.error('Validation failed', 400, errors);
  }

  static notFound(resource: string = 'Resource') {
    return this.error(`${resource} not found`, 404);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return this.error(message, 401);
  }

  static forbidden(message: string = 'Forbidden') {
    return this.error(message, 403);
  }

  static conflict(message: string = 'Resource already exists') {
    return this.error(message, 409);
  }

  static tooManyRequests(retryAfter?: number) {
    const headers: Record<string, string> = {};
    if (retryAfter) {
      headers['Retry-After'] = String(retryAfter);
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests',
        timestamp: new Date().toISOString(),
      },
      { status: 429, headers }
    );
  }

  static serverError(message: string = 'Internal server error') {
    return this.error(message, 500);
  }
}

export async function withErrorHandler<T>(
  handler: () => Promise<T>
): Promise<NextResponse> {
  try {
    const result = await handler();
    if (result instanceof NextResponse) {
      return result;
    }
    return ApiResponse.success(result);
  } catch (error: any) {
    console.error('API Error:', error);
    
    if (error.name === 'ValidationError') {
      return ApiResponse.validationError(error.errors);
    }
    
    if (error.status) {
      return ApiResponse.error(error.message, error.status);
    }
    
    return ApiResponse.serverError(
      process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    );
  }
}
