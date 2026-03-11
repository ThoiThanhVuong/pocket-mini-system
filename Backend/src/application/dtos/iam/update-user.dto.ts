import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus } from "../../../core/domain/enums/user-status.enum";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @IsOptional()
    @IsString()
    roleCode?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    baseSalary?: number;

    @IsOptional()
    @IsString()
    salaryType?: string;

    @IsOptional()
    warehouseIds?: string[];
}
