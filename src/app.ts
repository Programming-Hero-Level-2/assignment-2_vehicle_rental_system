import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';
import morgan from 'morgan';
import initializeDatabase, { pool } from './config/db';
import { authRouter } from './modules/auth/auth.router';
import { userRouter } from './modules/user/user.router';
import { vehicleRoutes } from './modules/vehicle/vehicle.routes';
import { bookingRoutes } from './modules/booking/booking.routes';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize the database
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });

// Health check route
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res
    .status(200)
    .json({ message: 'Server is healthy', success: true, code: 200 });
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// Handle 404 - Route not found
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: 'Route not found',
    success: false,
    code: 404,
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.log(err);
  res.status((err as any).status || 500).json({
    message: err.message,
    errors: (err as any).errors,
  });
});

export default app;
