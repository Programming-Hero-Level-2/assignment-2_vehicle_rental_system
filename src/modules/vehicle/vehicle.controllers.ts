import { NextFunction, Request, Response } from 'express';
import { vehicleService } from './vehicle.services';

const getVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicles = await vehicleService.getVehicles();

    const formattedVehicles = vehicles.map((vehicle) => ({
      id: vehicle.id,
      vehicle_name: vehicle.vehicle_name,
      type: vehicle.type,
      registration_number: vehicle.registration_number,
      daily_rent_price: vehicle.daily_rent_price,
      availability_status: vehicle.availability_status,
    }));

    if (vehicles.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No vehicles found',
        data: [],
      });
    }

    const vehiclesResponse = {
      success: true,
      message: 'Vehicles retrieved successfully',
      data: formattedVehicles,
    };

    return res.status(200).json(vehiclesResponse);
  } catch (error) {
    next(error);
  }
};

const createVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    vehicle_name,
    type,
    registration_number = '',
    daily_rent_price,
    availability_status,
  } = req.body;

  try {
    if (
      [vehicle_name, type, availability_status].some(
        (field) => field.trim() === ''
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    if (daily_rent_price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid daily rent price',
      });
    }

    const vehicle = await vehicleService.createVehicle({
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    });

    const formattedVehicles = {
      id: vehicle?.id,
      vehicle_name: vehicle?.vehicle_name,
      type: vehicle?.type,
      registration_number: vehicle?.registration_number,
      daily_rent_price: vehicle?.daily_rent_price,
      availability_status: vehicle?.availability_status,
    };

    const vehicleResponse = {
      success: true,
      message: 'Vehicle created successfully',
      data: formattedVehicles,
    };

    return res.status(201).json(vehicleResponse);
  } catch (error) {
    next(error);
  }
};

export const vehicleController = {
  getVehicles,
  createVehicle,
};
