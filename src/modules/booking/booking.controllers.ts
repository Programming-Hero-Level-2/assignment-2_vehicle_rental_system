import { NextFunction, Request, Response } from 'express';
import { BookingResponse, CreateBookingPayload } from './booking.types';
import { bookingService } from './booking.services';

const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let bookings: BookingResponse['data'];

    if (req.user?.role === 'admin') {
      bookings = await bookingService.getBookings();
    } else {
      bookings = await bookingService.findBookingsByUserId(req.user!.id);
    }

    if (bookings.length === 0) {
      return res.status(200).json({
        message: 'No bookings found',
        success: true,
        data: [],
      });
    }

    res.status(200).json({
      message: 'Bookings retrieved successfully',
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      vehicle_id,
      customer_id,
      rent_end_date,
      rent_start_date,
    }: CreateBookingPayload = req.body;

    if (!vehicle_id || !customer_id || !rent_start_date || !rent_end_date) {
      throw new Error('Missing required booking fields');
    }

    if (rent_end_date <= rent_start_date) {
      throw new Error('Invalid rent period');
    }

    const booking = await bookingService.createBooking({
      vehicle_id,
      customer_id,
      rent_end_date,
      rent_start_date,
    });

    res.status(201).json({
      message: 'Booking created successfully',
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const updateBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookingId = req.params.bookingId;
    const { status } = req.body;

    const updatedBooking = await bookingService.updateBooking(
      { status },
      bookingId!,
      req.user!.id
    );

    if (!updatedBooking) {
      return res.status(404).json({
        message: 'Booking not found',
        success: false,
      });
    }

    res.status(200).json({
      message: 'Booking updated successfully',
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const bookingController = {
  createBooking,
  getBookings,
  updateBooking,
};
