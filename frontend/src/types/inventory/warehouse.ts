export interface Warehouse {
    id: string;
    name: string;
    location: string;
    city?: string;
    country?: string;
    capacity?: number;
    manager?: string;
    contactInfo?: string;
    status?: string;
    createdAt?: Date | string; 
}

export interface CreateWarehouseDto {
    name: string;
    location: string;
    city?: string;
    country?: string;
    capacity?: number;
    manager?: string;
    contactInfo?: string;
    status?: string;
}

export interface UpdateWarehouseDto {
    name?: string;
    location?: string;
    city?: string;
    country?: string;
    capacity?: number;
    manager?: string;
    contactInfo?: string;
    status?: string;
}
