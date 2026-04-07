import { LoginDto } from '../../../../application/dtos/iam/login.dto';

export interface IAuthenticationService {
  login(loginDto: LoginDto): Promise<{ 
    accessToken: string; 
    user: { 
        id: string; 
        email: string; 
        fullName: string; 
        roles: string[]; 
        permissions: string[]; 
    } 
  }>;
  resetAdminPassword(): Promise<string>;
}

export const AuthenticationServiceKey = 'IAuthenticationService';
