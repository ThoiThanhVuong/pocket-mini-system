import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsEmail()
    @IsNotEmpty()
    email?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    phone?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    address?: string;

    @IsOptional()
    @IsString()
    customerType?: string;

    @IsOptional()
    @IsString()
    companyName?: string;

    @IsOptional()
    @IsString()
    loyaltyTier?: string;

    @IsOptional()
    @IsString()
    status?: string;
}
