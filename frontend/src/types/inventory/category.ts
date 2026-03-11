export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  level: number;
  parentId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  image?: string;
  parentId?: string;
}
