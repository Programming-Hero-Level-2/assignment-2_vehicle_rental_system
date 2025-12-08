export const handleError = (msg: string, statusCode: number): void => {
  const error = new Error(msg);
  (error as any).status = statusCode;
  throw error;
};
