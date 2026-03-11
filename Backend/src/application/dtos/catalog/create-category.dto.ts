import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
    @MinLength(3, { message: 'Tên danh mục tối thiểu 3 ký tự' })
    @MaxLength(100, { message: 'Tên danh mục tối đa 100 ký tự' })
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsString()
    parentId?: string;
}
