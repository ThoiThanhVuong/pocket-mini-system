export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  image: string;
  categoryId: string | null;
  unit: string;
  price: number;
  isActive: boolean;
  minStockLevel: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  price: number;
  description?: string;
  image?: string;
  categoryId?: string;
  unit: string;
  minStockLevel?: number;
}

export interface UpdateProductDto {
  sku?: string;
  name?: string;
  price?: number;
  description?: string;
  image?: string;
  categoryId?: string;
  unit?: string;
  minStockLevel?: number;
  isActive?: boolean;
}
