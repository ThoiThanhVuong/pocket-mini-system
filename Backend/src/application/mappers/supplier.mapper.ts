import { Supplier } from "../../core/domain/entities/partners/supplier.entity";
import { CreateSupplierDto } from "../dtos/partners/create-supplier.dto";
import { SupplierResponseDto } from "../dtos/partners/supplier-response.dto";
import { PartnerStatus } from "../../core/domain/enums/partners-status.enum";
import { v4 as uuidv4 } from 'uuid';

export class SupplierMapper {
    static toDomain(dto: CreateSupplierDto): Supplier {
        return new Supplier(
            uuidv4(),
            dto.name,
            dto.contactPerson,
            dto.phone,
            dto.email,
            dto.address,
            PartnerStatus.ACTIVE
        );
    }

    static toResponse(supplier: Supplier): SupplierResponseDto {
        return {
            id: supplier.id,
            name: supplier.name,
            contactPerson: supplier.contactPerson,
            phone: supplier.phone,
            email: supplier.email,
            address: supplier.address,
            status: supplier.status
        };
    }
}
