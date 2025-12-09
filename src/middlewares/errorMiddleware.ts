import { NextFunction, Request, Response } from 'express';

export interface ErrorResponseBody {
  success: false;
  message: string;
  errors?: string;
}

export interface AppError extends Error {
  status?: number;
  responseBody?: ErrorResponseBody;
}

const errorMiddleware = (
  err: AppError,
  _req: Request,
  res: Response<ErrorResponseBody>,
  _next: NextFunction
) => {
  const status = err.status || 500;

  const responseBody: ErrorResponseBody = {
    success: false,
    message: err.message || 'An unexpected server error occurred',
    errors: err.responseBody?.errors || err.message || 'Internal Server Error',
  };

  console.log(`[ERROR] :: ${err.message}`);

  res.status(status).json(responseBody);

};

export default errorMiddleware;
