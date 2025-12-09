import express from 'express';
import morgan from 'morgan';
import errorMiddleware from './middlewares/errorMiddleware';
import routerNotFound from './middlewares/routerNotFound';
import { authRouter } from './modules/auth/auth.router';
import { bookingRoutes } from './modules/booking/booking.routes';
import { userRouter } from './modules/user/user.router';
import { vehicleRoutes } from './modules/vehicle/vehicle.routes';
import asyncHandler from './utils/asyncHandler';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get(
  '/health',
  asyncHandler(async (_req, res) => {
    res
      .status(200)
      .json({ message: 'Server is healthy', success: true, code: 200 });
  })
);

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// Handle 404 - Route not found
app.use(routerNotFound);

// Use the error middleware
app.use(errorMiddleware);

export default app;
