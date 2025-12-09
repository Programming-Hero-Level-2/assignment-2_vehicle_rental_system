import ApiResponse from '../../utils/ApiResponse';
import asyncHandler from '../../utils/asyncHandler';
import { badRequest } from '../../utils/error';
import { vehicleService } from './vehicle.services';

const getVehicles = asyncHandler(async (_req, res) => {
  const vehicles = await vehicleService.getVehicles();

  const response =
    (vehicles.length !== 0 &&
      vehicles.map(({ created_at, updated_at, ...vehicle }) => vehicle)) ||
    [];

  return res
    .status(200)
    .json(
      vehicles.length === 0
        ? new ApiResponse('Vehicle not found', 200, response)
        : new ApiResponse('Vehicles retrieved successfully', 200, response)
    );
});

const createVehicle = asyncHandler(async (req, res) => {
  const {
    vehicle_name,
    type,
    registration_number = '',
    daily_rent_price,
    availability_status,
  } = req.body;

  if (
    [vehicle_name, type, availability_status].some(
      (field) => field.trim() === '' && !field
    )
  ) {
    throw badRequest('All fields are required');
  }

  if (daily_rent_price < 0) {
    throw badRequest('Daily rent price must be a positive number');
  }

  const vehicle = await vehicleService.createVehicle({
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  });

  const response = {
    id: vehicle?.id,
    vehicle_name: vehicle?.vehicle_name,
    type: vehicle?.type,
    registration_number: vehicle?.registration_number,
    daily_rent_price: vehicle?.daily_rent_price,
    availability_status: vehicle?.availability_status,
  };

  return res
    .status(201)
    .json(new ApiResponse('Vehicle created successfully', 201, response));
});

const getSingleVehicle = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;

  if (!vehicleId) {
    throw badRequest('Vehicle ID is required');
  }

  const vehicle = await vehicleService.getSingleVehicle(Number(vehicleId!));

  if (!vehicle) {
    throw badRequest('Vehicle not found');
  }

  delete (vehicle as Partial<typeof vehicle>)?.created_at;
  delete (vehicle as Partial<typeof vehicle>)?.updated_at;

  return res
    .status(200)
    .json(new ApiResponse('Vehicle retrieved successfully', 200, vehicle));
});

const updateVehicle = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  if (!vehicleId) {
    throw badRequest('Vehicle ID is required');
  }

  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = req.body;

  const updatedVehicle = await vehicleService.updateVehicle(
    {
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    },
    +vehicleId!
  );

  delete (updatedVehicle as Partial<typeof updatedVehicle>)?.created_at;
  delete (updatedVehicle as Partial<typeof updatedVehicle>)?.updated_at;

  return res
    .status(200)
    .json(new ApiResponse('Vehicle updated successfully', 200, updatedVehicle));
});

const deleteVehicle = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;

  if (!vehicleId) {
    throw badRequest('Vehicle ID is required');
  }

  await vehicleService.deleteVehicle(Number(vehicleId!));

  return res
    .status(200)
    .json(new ApiResponse('Vehicle deleted successfully', 200));
});

export const vehicleController = {
  getVehicles,
  createVehicle,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle,
};
