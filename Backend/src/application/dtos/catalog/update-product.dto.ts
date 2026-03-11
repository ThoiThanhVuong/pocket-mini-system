import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateProductDto{
    @IsString()
    @IsOptional()
    sku?:string;

    @IsString()
    @IsOptional()
    name?:string;

    @IsNumber()
    @IsOptional()
    @Min(0,{message:'Price must be greater than or equal to 0'})
    price?:number;

    @IsString()
    @IsOptional()
    description?:string;

    @IsString()
    @IsOptional()
    image?:string;

    @IsString()
    @IsOptional()
    categoryId:string;

    @IsString()
    @IsOptional()
    unit:string;

    @IsNumber()
    @IsOptional()
    @Min(0,{message:'Minimum stock must be greater than or equal to 0'})
    minStockLevel?:number;

    @IsBoolean()
    @IsOptional()
    isActive?:boolean;
}