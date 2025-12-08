import { pool } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { handleError } from '../../utils/error';
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
      availability_status.toLocaleLowerCase(),
    ]
  );

  return result.rowCount === 0 ? null : result.rows[0];
};

const getSingleVehicle = async (
  vehicleId: string
): Promise<(Vehicle & { created_at: Date; updated_at: Date }) | null> => {
  const vehicle = await pool.query('SELECT * FROM vehicles WHERE id = $1', [
    vehicleId,
  ]);

  return vehicle.rowCount === 0 ? null : vehicle.rows[0];
};

const updateVehicle = async (
  payload: Omit<Vehicle, 'id'>,
  id: string
): Promise<(Vehicle & { created_at: Date; updated_at: Date }) | null> => {
  const existingVehicle = await getSingleVehicle(id);

  if (!existingVehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  const checkRegistrationNumber = await pool.query(
    'SELECT * FROM vehicles WHERE registration_number = $1',
    [payload.registration_number]
  );

  if (checkRegistrationNumber.rowCount !== 0) {
    throw new Error('Registration number already exists');
  }

  const result = await pool.query(
    `UPDATE vehicles SET 
    vehicle_name = $1,
    type = $2,
    registration_number = $3,
    daily_rent_price = $4,
    availability_status = $5,
    updated_at = NOW()
    WHERE id = $6 RETURNING *`,
    [
      payload.vehicle_name,
      payload.type,
      payload.registration_number,
      payload.daily_rent_price,
      payload.availability_status,
      id,
    ]
  );

  return result.rowCount == 0 ? null : result.rows[0];
};

const deleteVehicle = async (
  id: string
): Promise<(Vehicle & { created_at: Date; updated_at: Date }) | null> => {
  // const activeBooking = await pool.query(
  //   'SELECT * FROM bookings WHERE vehicle_id = $1 AND status = $2',
  //   [id, 'active']
  // );

  // if (activeBooking.rowCount !== 0) {
  //   throw new ApiError(400, 'Cannot delete vehicle with active bookings');
  // }

  const result = await pool.query(
    'DELETE FROM vehicles WHERE id = $1 RETURNING *',
    [id]
  );

  return result.rowCount === 0 ? null : result.rows[0];
};

export const vehicleService = {
  getVehicles,
  createVehicle,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle,
};
