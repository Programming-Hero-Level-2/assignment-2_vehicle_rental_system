import { Pool } from 'pg';
import config from '.';

export const pool = new Pool({
  connectionString: config.DB_CONNECTION_STRING,
});

const initializeDatabase = async () => {
  try {
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('customer', 'admin');
        END IF;
      END
      $$;
    `);
    await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 6),
    role user_role DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
`);

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_type') THEN
          CREATE TYPE vehicle_type AS ENUM ('car','bike', 'van', 'suv');
        END IF;
      END
      $$;
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'availability_status') THEN
          CREATE TYPE availability_status AS ENUM ('available', 'booked');
        END IF;
      END
      $$;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      vehicle_name VARCHAR(100) NOT NULL,
      type vehicle_type NOT NULL,
      registration_number VARCHAR(50) UNIQUE NOT NULL,
      daily_rent_price NUMERIC(10, 2) NOT NULL CHECK (daily_rent_price >= 0),
      availability_status availability_status NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
      `);

    await pool.query(`
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM ('active', 'cancelled', 'returned');
  END IF;
END
$$;
`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
      vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
      rent_start_date TIMESTAMP NOT NULL,
      rent_end_date TIMESTAMP NOT NULL,
      total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
      CHECK (rent_end_date > rent_start_date),
      status booking_status NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
      `);
  } catch (error) {
    console.error(
      '[DATABASE INITIALIZATION ERROR]:: Database connection error:',
      error
    );
    process.exit(1);
  }
};

export default initializeDatabase;
