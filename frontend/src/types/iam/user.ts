// Role structure from backend
export interface Role {
  id: string;
  roleCode: string;
  name: string;
}

// User entity matching backend UserResponseDto
export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: string;
  roles: Role[]; // Array of role objects
  permissions: string[];
  warehouseIds?: string[];
  baseSalary?: number;
  salaryType?: 'MONTHLY' | 'HOURLY';
}

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  roleCode?: string;
  baseSalary?: number;
  salaryType?: 'MONTHLY' | 'HOURLY';
  warehouseIds?: string[];
}

export interface UpdateUserInput {
  fullName?: string;
  phoneNumber?: string;
  status?: string;
  roleCode?: string;
  password?: string;
  baseSalary?: number;
  salaryType?: 'MONTHLY' | 'HOURLY';
  warehouseIds?: string[];
}

export interface UpdateProfileInput {
    fullName?: string;
    phoneNumber?: string;
    password?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
    permissions: string[];
    warehouseIds?: string[];
  };
}