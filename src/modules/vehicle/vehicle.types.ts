export type Vehicle = {
  id: number;
  vehicle_name: string;
  type: 'car' | 'bike' | 'van' | 'SUV';
  registration_number: string;
  daily_rent_price: number;
  availability_status: 'available' | 'booked';
};

export type Vehicles = {
  success: boolean;
  message: string;
  data: Vehicle[];
};

export type DeleteVehicleResponse = {
  message: string;
  success: boolean;
};
