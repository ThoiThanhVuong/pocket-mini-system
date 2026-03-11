import { Customer } from "../../core/domain/entities/partners/customer.entity";
import { CreateCustomerDto } from "../dtos/partners/create-customer.dto";
import { CustomerResponseDto } from "../dtos/partners/customer-response.dto";
import { PartnerStatus } from "../../core/domain/enums/partners-status.enum";
import { v4 as uuidv4 } from 'uuid';

export class CustomerMapper {
    static toDomain(dto: CreateCustomerDto): Customer {
        return new Customer(
            uuidv4(),
            dto.name,
            dto.phone,
            dto.email,
            dto.address,
            (dto.status as PartnerStatus) || PartnerStatus.ACTIVE,
            dto.customerType,
            dto.companyName,
            dto.loyaltyTier || 'Bronze'
        );
    }

    static toResponse(customer: Customer): CustomerResponseDto {
        return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            status: customer.status,
            customerType: customer.customerType,
            companyName: customer.companyName,
            loyaltyTier: customer.loyaltyTier,
            totalOrders: customer.totalOrders,
            totalSpent: customer.totalSpent
        };
    }
}
