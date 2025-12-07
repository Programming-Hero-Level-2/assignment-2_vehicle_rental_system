import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const config = {
  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || '',
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) || 1600,
};

export default config;
