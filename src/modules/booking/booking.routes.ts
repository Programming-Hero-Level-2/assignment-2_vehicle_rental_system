import express from 'express';
import authenticated from '../../middlewares/authenticated';
import ownership from '../../middlewares/ownership';
import authorize from '../../middlewares/authorize';
import { bookingController } from './booking.controllers';

const router = express.Router();

router
  .get(
    '/',
    authenticated,
    authorize(['customer', 'admin']),
    bookingController.getBookings
  )
  .post('/', authenticated, bookingController.createBooking);
router
  .get('/:bookingId', () => {})
  .put(
    '/:bookingId',
    authenticated,
    authorize(['customer', 'admin']),
    bookingController.updateBooking
  );

export const bookingRoutes = router;
