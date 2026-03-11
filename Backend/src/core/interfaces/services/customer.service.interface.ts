import { Customer } from "../../domain/entities/partners/customer.entity";

export interface ICustomerService {
    createCustomer(name: string, email: string, phone: string, address: string, customerType: string, companyName?: string, loyaltyTier?: string, status?: string): Promise<Customer>;
    updateCustomer(id: string, data: Partial<Customer>): Promise<Customer>;
    deleteCustomer(id: string): Promise<void>;
    getCustomerById(id: string): Promise<Customer | null>;
    getAllCustomers(search?: string, status?: string, customerType?: string): Promise<Customer[]>;
    countCustomers(search?: string, status?: string, customerType?: string): Promise<number>;
}

export const ICustomerServiceKey = 'ICustomerService';