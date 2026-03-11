import { Supplier } from "../../domain/entities/partners/supplier.entity";

export interface ISupplierService{
    createSupplier(name: string, contactPerson: string, phone: string, email: string, address: string): Promise<Supplier>;
    updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier>;
    deleteSupplier(id: string): Promise<void>;
    getSupplierById(id: string): Promise<Supplier | null>;
    getAllSuppliers(search?: string, status?: string): Promise<Supplier[]>;
    countSuppliers(search?: string, status?: string): Promise<number>;
}
export const ISupplierServiceKey = 'ISupplierService';