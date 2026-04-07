import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, IsMobilePhone } from 'class-validator';

export class CreateSupplierDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-zA-ZÀ-ỹ\s]+$/u, { message: 'Tên nhà cung cấp chỉ được chứa chữ cái và khoảng trắng' })
    name: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-zA-ZÀ-ỹ\s]+$/u, { message: 'Tên người liên hệ chỉ được chứa chữ cái và khoảng trắng' })
    contactPerson: string;

    @IsString()
    @IsNotEmpty()
    @IsMobilePhone('vi-VN', {}, { message: 'Số điện thoại không hợp lệ (VD: 0901234567)' })
    phone: string;

    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    status?: string;
}
