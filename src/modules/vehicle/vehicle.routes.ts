import express from 'express';
import { vehicleController } from './vehicle.controllers';
import authenticated from '../../middlewares/authenticated';
import authorize from '../../middlewares/authorize';

const router = express.Router();

router
  .get('/', vehicleController.getVehicles)
  .post(
    '/',
    authenticated,
    authorize(['admin']),
    vehicleController.createVehicle
  );

router
  .get('/:vehicleId', vehicleController.getSingleVehicle) // Public
  .put(
    '/:vehicleId',
    authenticated,
    authorize(['admin']),
    vehicleController.updateVehicle
  )
  .delete(
    '/:vehicleId',
    authenticated,
    authorize(['admin']),
    vehicleController.deleteVehicle
  ); // admin only (only is no active bookings exist)

export const vehicleRoutes = router;
