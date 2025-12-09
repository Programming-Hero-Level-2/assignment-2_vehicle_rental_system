import asyncHandler from '../utils/asyncHandler';

const routerNotFound = asyncHandler(async (_req, res, _next) => {
  res.status(404).json({
    message: 'Route not found',
    success: false,
    code: 404,
  });
});

export default routerNotFound;
