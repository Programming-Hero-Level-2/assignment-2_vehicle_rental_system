interface AppError extends Error {
  status?: number;
}

export const badRequest = (msg = 'Bad Request') => {
  const error: AppError = new Error(msg);
  error.status = 400;
  return error;
};

export const authenticationError = (msg = 'Unauthorized') => {
  const error: AppError = new Error(msg);
  error.status = 401;
  return error;
};

export const authorizationError = (msg = 'Forbidden') => {
  const error: AppError = new Error(msg);
  error.status = 403;
  return error;
};

export const notFound = (msg = 'Resource not found') => {
  const error: AppError = new Error(msg);
  error.status = 404;
  return error;
};

export const serverError = (msg = 'Internal Server Error') => {
  const error: AppError = new Error(msg);
  error.status = 500;
  return error;
};

export const errorHandler = (msg: string, statusCode: number): AppError => {
  const error: AppError = new Error(msg);
  error.status = statusCode;
  return error;
};
