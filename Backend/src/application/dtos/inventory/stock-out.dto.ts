import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class StockOutItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity: number;

    @IsNumber()
    @Min(0, { message: 'Price cannot be negative' })
    price: number;
}

export class CreateStockOutDto {
    @IsString()
    @IsNotEmpty()
    customerId: string;

    @IsString()
    @IsNotEmpty()
    warehouseId: string;

    @IsString()
    @IsNotEmpty()
    referenceCode: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StockOutItemDto)
    items: StockOutItemDto[];

    @IsString()
    @IsOptional()
    notes?: string;
}
