import app from './app';
import config from './config';
import { pool } from './config/db';

const PORT = config.PORT || 5000;


pool
  .connect()
  .then(() => {
    console.log('Connected to the database successfully');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${config.NODE_ENV} mode`);
});
