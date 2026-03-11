import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class StockInItemDto {
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

export class CreateStockInDto {
    @IsString()
    @IsNotEmpty()
    supplierId: string;

    @IsString()
    @IsNotEmpty()
    warehouseId: string;

    @IsString()
    @IsNotEmpty()
    referenceCode: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StockInItemDto)
    items: StockInItemDto[];

    @IsString()
    @IsOptional()
    notes?: string;
}
