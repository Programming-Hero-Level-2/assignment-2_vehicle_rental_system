type Booking = {
  id: number;
  customer_id: number;
  vehicle_id: number;
  rent_start_date: Date;
  rent_end_date: Date;
  total_price: number;
  status: 'active' | 'returned' | 'cancelled';
};

type BookingWithDetails = Booking & {
  customer: {
    name: string;
    email: string;
  };
  vehicle: {
    vehicle_name: string;
    registration_number: string;
  };
};

export type BookingResponse = {
  success: boolean;
  message: string;
  data: BookingWithDetails[];
};

export type CreateBookingPayload = {
  customer_id: number;
  vehicle_id: number;
  rent_start_date: Date;
  rent_end_date: Date;
};

export type CreateBookingResponse = {
  data: Booking & {
    vehicle: BookingWithDetails['vehicle'];
  };
};
