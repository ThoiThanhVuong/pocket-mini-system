import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, IsMobilePhone } from 'class-validator';

export class CreateCustomerDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-zA-ZÀ-ỹ\s]+$/u, { message: 'Họ tên chỉ được chứa chữ cái và khoảng trắng' })
    name: string;

    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @IsString()
    @IsNotEmpty()
    @IsMobilePhone('vi-VN', {}, { message: 'Số điện thoại không hợp lệ (VD: 0901234567)' })
    phone: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsString()
    @IsNotEmpty()
    customerType: string;

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