import { NextFunction, Request, Response } from 'express';
import { BookingResponse, CreateBookingPayload } from './booking.types';
import { bookingService } from './booking.services';
import asyncHandler from '../../utils/asyncHandler';
import ApiResponse from '../../utils/ApiResponse';
import { badRequest, notFound } from '../../utils/error';

const getBookings = asyncHandler(async (req, res) => {
  await bookingService.updateExpiredActiveBookings();

  let bookings: BookingResponse['data'];
  if (req.user?.role === 'admin') {
    bookings = await bookingService.getBookings();
  } else {
    bookings = await bookingService.findBookingsByUserId(req.user!.id);
  }

  res
    .status(200)
    .json(
      bookings.length === 0
        ? new ApiResponse('No bookings found', 200, [])
        : new ApiResponse('Bookings retrieved successfully', 200, bookings)
    );
});

const createBooking = asyncHandler(async (req, res) => {
  const {
    vehicle_id,
    customer_id,
    rent_end_date,
    rent_start_date,
  }: CreateBookingPayload = req.body;

  if (!vehicle_id || !customer_id || !rent_start_date || !rent_end_date) {
    throw badRequest('Missing required booking fields');
  }

  if (rent_end_date <= rent_start_date) {
    throw badRequest('Invalid rent period');
  }

  const booking = await bookingService.createBooking({
    vehicle_id,
    customer_id,
    rent_end_date,
    rent_start_date,
  });

  res
    .status(201)
    .json(new ApiResponse('Booking created successfully', 201, booking));
});

const updateBooking = asyncHandler(async (req, res) => {
  const bookingId = req.params.bookingId;
  const { status } = req.body;

  if (!bookingId) {
    throw badRequest('Booking ID is required');
  }

  if (!status) {
    throw badRequest('Status is required to update booking');
  }

  const updatedBooking = await bookingService.updateBooking(
    { status },
    bookingId!,
    req.user!.id
  );

  if (!updatedBooking) {
    throw notFound('Booking not found');
  }

  res
    .status(200)
    .json(new ApiResponse('Booking updated successfully', 200, updatedBooking));
});

export const bookingController = {
  createBooking,
  getBookings,
  updateBooking,
};
