interface AppError extends Error {
  status?: number;
}

const badRequest = (msg = 'Bad Request') => {
  const error: AppError = new Error(msg);
  error.status = 400;
  return error;
};

const authenticationError = (msg = 'Unauthorized') => {
  const error: AppError = new Error(msg);
  error.status = 401;
  return error;
};

const authorizationError = (msg = 'Forbidden') => {
  const error: AppError = new Error(msg);
  error.status = 403;
  return error;
};

const notFound = (msg = 'Resource not found') => {
  const error: AppError = new Error(msg);
  error.status = 404;
  return error;
};

const serverError = (msg = 'Internal Server Error') => {
  const error: AppError = new Error(msg);
  error.status = 500;
  return error;
};

const errorHandler = (msg: string, statusCode: number): AppError => {
  const error: AppError = new Error(msg);
  error.status = statusCode;
  return error;
};

export default {
  notFound,
  badRequest,
  serverError,
  authenticationError,
  authorizationError,
  errorHandler,
};
