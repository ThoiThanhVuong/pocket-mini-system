// Permission interface
export interface Permission {
  id: string;
  permissionCode: string;
  description: string;
}

// Role interface matching backend
export interface Role {
  id: string;
  roleCode: string;
  name: string;
  description: string;
  permissions: Permission[];
  baseSalary?: number;
  salaryType?: 'MONTHLY' | 'HOURLY';
}

// Role creation/update inputs
export interface CreateRoleInput {
  name: string;
  description: string;
  baseSalary?: number;
  salaryType?: 'MONTHLY' | 'HOURLY';
}

export interface UpdateRoleInput {
  name: string;
  description: string;
  baseSalary?: number;
  salaryType?: 'MONTHLY' | 'HOURLY';
}
