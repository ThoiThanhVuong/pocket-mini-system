import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    fullName: string;

    @IsOptional()
    phoneNumber?: string;

    @IsOptional()
    roleCode?: string;

    @IsOptional()
    baseSalary?: number;

    @IsOptional()
    salaryType?: string;

    @IsOptional()
    warehouseIds?: string[];
}
