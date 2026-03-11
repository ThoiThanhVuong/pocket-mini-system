import { IsString, IsNotEmpty, IsOptional, MinLength, IsInt, Min } from 'class-validator';

export class CreateWarehouseDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    location: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    country?: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    capacity?: number;

    @IsString()
    @IsOptional()
    manager?: string;

    @IsString()
    @IsOptional()
    contactInfo?: string;

    @IsString()
    @IsOptional()
    status?: string;
}

export class UpdateWarehouseDto {
    @IsString()
    @IsOptional()
    @MinLength(3)
    name?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    country?: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    capacity?: number;

    @IsString()
    @IsOptional()
    manager?: string;

    @IsString()
    @IsOptional()
    contactInfo?: string;

    @IsString()
    @IsOptional()
    status?: string;
}
