import express, { Request, Response } from 'express';
import morgan from 'morgan';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/v1/health', (_req: Request, res: Response) => {
  res
    .status(200)
    .json({ message: 'Server is healthy', success: true, code: 200 });
});

// Register other routes here

// Handle 404 - Route not found
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: 'Route not found',
    success: false,
    code: 404,
  });
});

export default app;
