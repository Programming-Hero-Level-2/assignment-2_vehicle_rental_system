export type RegisterInputType = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'customer' | 'admin';
};
