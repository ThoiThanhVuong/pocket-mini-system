import { Injectable, Inject, NotFoundException, BadRequestException } from "@nestjs/common";
import { ICustomerService } from "../../core/interfaces/services/customer.service.interface";
import type { ICustomerRepository } from "../../core/interfaces/repositories/customer.repositories.interface";
import { Customer } from "../../core/domain/entities/partners/customer.entity";
import { PartnerStatus } from "../../core/domain/enums/partners-status.enum";
import { CustomerMapper } from "../mappers/customer.mapper";
import { CreateCustomerDto } from "../dtos/partners/create-customer.dto";
import { Email } from "../../core/domain/value-objects/email.value-object";

@Injectable()
export class CustomerService implements ICustomerService {
    constructor(
        @Inject('ICustomerRepository')
        private readonly repo: ICustomerRepository,
    ) {}

    async createCustomer(
        name: string, 
        email: string, 
        phone: string, 
        address: string,
        customerType: string,
        companyName?: string,
        loyaltyTier?: string,
        status?: string
    ): Promise<Customer> {
        const existingCustomer = await this.repo.findByEmail(new Email(email)) ;
        if (existingCustomer) {
            throw new BadRequestException('Customer already exists');
        }
        const dto: CreateCustomerDto = { 
            name, 
            email, 
            phone, 
            address, 
            customerType, 
            companyName, 
            loyaltyTier,
            status
        };
        const newCustomer = CustomerMapper.toDomain(dto);
        return await this.repo.save(newCustomer);
    }

    async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
        const customer = await this.repo.findOneById(id);
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        customer.updateDetails(
            data.name, 
            data.phone, 
            data.email, 
            data.address, 
            data.customerType, 
            data.companyName, 
            data.loyaltyTier
        );
        
        if (data.status) {
            if (data.status === PartnerStatus.ACTIVE) customer.activate();
            else if (data.status === PartnerStatus.INACTIVE) customer.markAsInactive();
            else if (data.status === PartnerStatus.BLOCKED) customer.block();
        }

        return await this.repo.save(customer);
    }

    async deleteCustomer(id: string): Promise<void> {
        const customer = await this.repo.findOneById(id);
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }
        await this.repo.remove(customer);
    }

    async getCustomerById(id: string): Promise<Customer | null> {
        return await this.repo.findOneById(id);
    }

    async getAllCustomers(search?: string, status?: string, customerType?: string): Promise<Customer[]> {
        return await this.repo.findAllWithFilters(search, status, customerType);
    }

    async countCustomers(search?: string, status?: string, customerType?: string): Promise<number> {
        const customers = await this.repo.findAllWithFilters(search, status, customerType);
        return customers.length;
    }
}