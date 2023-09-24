export interface UserSchema {
  id: number;
  firstName: string;
  lastName: string;
  photo: string;
  phone?: string;
  bio?: string;
  role: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
  isVerified: boolean;
  isActive: boolean;
  refreshToken: string,
  password: string,
  requests: number,
  lastRequest: Date,
}
