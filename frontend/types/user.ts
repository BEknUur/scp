import { Role } from '@/enums';

export interface User {
  id: number;
  email: string;
  role: Role;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}
