import { NextFunction, Request, Response } from 'express';

const routerNotFound = (_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    message: 'Route not found',
    success: false,
    code: 404,
  });
};

export default routerNotFound;
