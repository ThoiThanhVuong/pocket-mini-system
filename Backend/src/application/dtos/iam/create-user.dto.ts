import { IsEmail, IsNotEmpty, IsOptional, MinLength, IsPhoneNumber } from 'class-validator';

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
    @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ (định dạng Việt Nam).' })
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
