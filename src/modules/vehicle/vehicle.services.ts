import { pool } from '../../config/db';
import { generateVehicleNumber } from '../../utils/genereateVehicleNumber';
import { Vehicle } from './vehicle.types';

const getVehicles = async (): Promise<
  (Vehicle & { created_at: Date; updated_at: Date })[]
> => {
  const vehicles = await pool.query('SELECT * FROM vehicles');

  return vehicles.rowCount === 0 ? [] : vehicles.rows;
};

const createVehicle = async (
  payload: Partial<Omit<Vehicle, 'id'>>
): Promise<(Vehicle & { created_at: Date; updated_at: Date }) | null> => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status = 'available',
  } = payload;

  let generatedRegNumber = generateVehicleNumber();

  const vehicleCheck = await pool.query(
    'SELECT * FROM vehicles WHERE registration_number = $1',
    [generatedRegNumber]
  );

  if (vehicleCheck.rowCount === 0) {
    generatedRegNumber = generateVehicleNumber();
  }

  const registrationNumber = registration_number
    ? registration_number
    : generatedRegNumber;

  const isExistingNumber = await pool.query(
    'SELECT * FROM vehicles WHERE registration_number = $1',
    [registrationNumber]
  );

  if (isExistingNumber.rowCount !== 0) {
    throw new Error('Registration number already exists');
  }

  const result = await pool.query(
    `INSERT INTO vehicles 
     (vehicle_name, type, registration_number, daily_rent_price, availability_status)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      vehicle_name,
      type,
      registrationNumber,
      daily_rent_price,
      availability_status,
    ]
  );

  return result.rowCount === 0 ? null : result.rows[0];
};

export const vehicleService = {
  getVehicles,
  createVehicle,
};
