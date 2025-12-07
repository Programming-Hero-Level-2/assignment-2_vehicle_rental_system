export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'admin';
  created_at: Date;
  updated_at: Date;
};

export type CreateUserType = Omit<User, 'id' | 'created_at' | 'updated_at'>;


export type UpdateUserType = Partial<CreateUserType>;
export type DeleteResponseType = {
  code: number;
  message: string;
  success: boolean;
}
