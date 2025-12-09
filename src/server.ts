import app from './app';
import config from './config';
import initializeDatabase from './config/db';

const PORT = config.PORT || 5000;

(async () => {
  try {
    await initializeDatabase();
    console.log('✅Connected to the database successfully');

    app.listen(PORT, () => {
      console.log(
        `Server is running on port ${PORT} in ${config.NODE_ENV} mode`
      );
    });
  } catch (err) {
    console.error('DATABASE ERROR::', err);
    throw new Error('Database Error!!');
  }
})();
