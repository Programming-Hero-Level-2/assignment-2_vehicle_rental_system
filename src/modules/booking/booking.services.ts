import { userController } from './../user/user.controller';
import { pool } from '../../config/db';
import calculateDateDifference from '../../utils/dateCalculator';
import { userServices } from '../user/user.services';
import { vehicleService } from '../vehicle/vehicle.services';
import {
  BookingResponse,
  CreateBookingPayload,
  CreateBookingResponse,
} from './booking.types';

const getBookings = async (): Promise<BookingResponse['data']> => {
  const results = await pool.query('SELECT * FROM bookings;');

  const bookings = results.rowCount === 0 ? [] : results.rows;

  const bookingsWithDetails = bookings.map(async (booking) => {
    const user = await userServices.findUserById(booking.customer_id);
    const vehicle = await vehicleService.getSingleVehicle(booking.vehicle_id);
    return {
      ...booking,
      customer: { name: user?.name, email: user?.email },
      vehicle: {
        vehicle_name: vehicle?.vehicle_name,
        registration_number: vehicle?.registration_number,
      },
    };
  });

  return bookingsWithDetails.length === 0
    ? []
    : await Promise.all(bookingsWithDetails);
};

const createBooking = async (
  payload: CreateBookingPayload
): Promise<CreateBookingResponse['data'] | null> => {
  const { vehicle_id, customer_id, rent_start_date, rent_end_date } = payload;

  const vehicleQuery = await pool.query(
    `
    SELECT * FROM vehicles WHERE id = $1 AND availability_status = 'available';
  `,
    [vehicle_id]
  );

  const userQuery = await pool.query(
    `
    SELECT * FROM users WHERE id = $1;
  `,
    [customer_id]
  );

  if (vehicleQuery.rowCount === 0) {
    throw new Error('Vehicle is not available for booking');
  }

  if (userQuery.rowCount === 0) {
    throw new Error('Customer does not exist');
  }

  const rendStartDate = new Date(rent_start_date);
  const rendEndDate = new Date(rent_end_date);

  if (rendEndDate <= rendStartDate) {
    throw new Error('Invalid rent period');
  }
  const numberOfDays = calculateDateDifference(rendStartDate, rendEndDate);

  const totalPrice =
    vehicleQuery.rows[0].daily_rent_price * (numberOfDays || 1);

  const result = await pool.query(
    `
    INSERT INTO bookings (vehicle_id, customer_id, rent_start_date, rent_end_date, total_price, status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
    `,
    [
      vehicleQuery.rows[0].id,
      userQuery.rows[0].id,
      rent_start_date,
      rent_end_date,
      totalPrice,
      'active',
    ]
  );

  await pool.query(
    `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`,
    [vehicle_id]
  );

  return result.rowCount === 0
    ? null
    : {
        ...result.rows[0],
        customer: {
          name: userQuery.rows[0].name,
          email: userQuery.rows[0].email,
        },
        vehicle: {
          vehicle_name: vehicleQuery.rows[0].vehicle_name,
          registration_number: vehicleQuery.rows[0].registration_number,
        },
      };
};

const findBookingsByUserId = async (
  userId: string
): Promise<BookingResponse['data']> => {
  const results = await pool.query(
    'SELECT * FROM bookings WHERE customer_id = $1;',
    [userId]
  );

  const bookings = results.rowCount === 0 ? [] : results.rows;

  const bookingsWithDetails = bookings.map(async (booking) => {
    const user = await userServices.findUserById(booking.customer_id);
    const vehicle = await vehicleService.getSingleVehicle(booking.vehicle_id);
    return {
      ...booking,
      customer: { name: user?.name, email: user?.email },
      vehicle: {
        vehicle_name: vehicle?.vehicle_name,
        registration_number: vehicle?.registration_number,
      },
    };
  });

  return bookingsWithDetails.length === 0
    ? []
    : await Promise.all(bookingsWithDetails);
};
const updateBooking = async (
  payload: { status: 'active' | 'cancelled' | 'returned' },
  bookingId: string,
  customerId: string
): Promise<CreateBookingResponse['data'] | null> => {
  const existingBookingQuery = await pool.query(
    'SELECT * FROM bookings WHERE id = $1;',
    [bookingId]
  );

  if (existingBookingQuery.rowCount === 0) {
    throw new Error('Booking not found');
  }

  const booking = existingBookingQuery.rows[0];

  const user = await userServices.findUserById(customerId);

  const isCustomerBooking = await pool.query(
    'SELECT * FROM bookings WHERE id = $1 AND customer_id = $2;',
    [bookingId, customerId]
  );

  if (isCustomerBooking.rowCount === 0 && user?.role === 'customer') {
    throw new Error('Unauthorized to update this booking');
  }

  const vehicle = await vehicleService.getSingleVehicle(booking.vehicle_id);

  if (!user || !vehicle) {
    throw new Error('User or Vehicle not found');
  }

  const now = new Date();

  if (now > booking.rent_end_date && booking.status !== 'returned') {
    await pool.query(`UPDATE bookings SET status = 'returned' WHERE id = $1`, [
      bookingId,
    ]);

    await pool.query(
      `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
      [booking.vehicle_id]
    );
  }

  if (user.role === 'customer') {
    if (payload.status !== 'cancelled') {
      throw new Error('Customers can only cancel bookings');
    }

    if (now >= booking.rent_start_date) {
      throw new Error('Cannot cancel booking after the rental start date');
    }
  }

  if (user.role === 'admin') {
    if (payload.status === 'returned') {
      await pool.query(
        `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
        [booking.vehicle_id]
      );
    }
  }

  const updateResult = await pool.query(
    `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *;`,
    [payload.status, bookingId]
  );

  const updatedBooking = updateResult.rows[0];

  if (payload.status === 'cancelled' || payload.status === 'returned') {
    await pool.query(
      `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
      [booking.vehicle_id]
    );
  }

  return {
    ...updatedBooking,
    customer: { name: user.name, email: user.email },
    vehicle: {
      vehicle_name: vehicle.vehicle_name,
      registration_number: vehicle.registration_number,
    },
  };
};

const updateExpiredActiveBookings = async (): Promise<void> => {
  const now = new Date();

  const expiredBookingsResult = await pool.query(
    `SELECT * FROM bookings WHERE rent_end_date < $1 AND status = 'active';`,
    [now]
  );

  const expiredBookings = expiredBookingsResult.rows;

  for (const booking of expiredBookings) {
    await pool.query(
      `UPDATE bookings SET status = 'returned', updated_at = NOW() WHERE id = $1;`,
      [booking.id]
    );

    await pool.query(
      `UPDATE vehicles SET availability_status = 'available' WHERE id = $1;`,
      [booking.vehicle_id]
    );
  }
};

export const bookingService = {
  getBookings,
  createBooking,
  updateBooking,
  findBookingsByUserId,
  updateExpiredActiveBookings,
};
