import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class StockTransferItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity: number;
}

export class CreateStockTransferDto {
    @IsString()
    @IsNotEmpty()
    fromWarehouseId: string;

    @IsString()
    @IsNotEmpty()
    toWarehouseId: string;

    @IsString()
    @IsNotEmpty()
    referenceCode: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StockTransferItemDto)
    items: StockTransferItemDto[];

    @IsString()
    @IsOptional()
    notes?: string;
}
