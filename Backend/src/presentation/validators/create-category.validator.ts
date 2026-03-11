import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

// Validator này đóng vai trò như DTO (Data Transfer Object) cho Input
export class CreateCategoryValidator {
    @IsString({ message: 'Tên danh mục phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
    @MaxLength(100, { message: 'Tên danh mục không được quá 100 ký tự' })
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    image?: string;
}
