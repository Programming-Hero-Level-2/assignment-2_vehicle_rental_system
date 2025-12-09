import e from 'express';
import { pool } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { badRequest, notFound, serverError } from '../../utils/error';
import { generateVehicleNumber } from '../../utils/generateVehicleNumber';
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
    throw badRequest('Registration number already exists');
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

  if (result.rowCount === 0) {
    throw serverError('Failed to create vehicle');
  }

  return result.rows[0];
};

const getSingleVehicle = async (
  vehicleId: number
): Promise<(Vehicle & { created_at: Date; updated_at: Date }) | null> => {
  const vehicle = await pool.query('SELECT * FROM vehicles WHERE id = $1', [
    vehicleId,
  ]);

  return vehicle.rowCount === 0 ? null : vehicle.rows[0];
};

const updateVehicle = async (
  payload: Omit<Vehicle, 'id'>,
  id: number
): Promise<Vehicle & { created_at: Date; updated_at: Date }> => {
  const existingVehicle = await getSingleVehicle(id);

  if (!existingVehicle) {
    throw notFound('Vehicle not found');
  }

  const checkRegistrationNumber = await pool.query(
    'SELECT * FROM vehicles WHERE registration_number = $1',
    [payload.registration_number]
  );

  if (checkRegistrationNumber.rowCount !== 0) {
    throw badRequest('Registration number already exists');
  }

  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;

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
      vehicle_name ?? existingVehicle.vehicle_name,
      type ?? existingVehicle.type,
      registration_number ?? existingVehicle.registration_number,
      daily_rent_price ?? existingVehicle.daily_rent_price,
      availability_status ?? existingVehicle.availability_status,
      id,
    ]
  );

  if (result.rowCount === 0) {
    throw serverError('Failed to update vehicle');
  }

  return result.rows[0];
};

const deleteVehicle = async (
  id: number
): Promise<Vehicle & { created_at: Date; updated_at: Date }> => {
  const activeBooking = await pool.query(
    'SELECT * FROM bookings WHERE vehicle_id = $1 AND status = $2',
    [id, 'active']
  );

  if (activeBooking.rowCount !== 0) {
    throw badRequest('Cannot delete vehicle with active bookings');
  }

  const result = await pool.query(
    'DELETE FROM vehicles WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rowCount === 0) {
    throw serverError('Failed to delete vehicle');
  }

  return result.rows[0];
};

export const vehicleService = {
  getVehicles,
  createVehicle,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle,
};
