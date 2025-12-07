import { Pool } from 'pg';
import config from '.';

export const pool = new Pool({
  connectionString: config.DB_CONNECTION_STRING,
});
