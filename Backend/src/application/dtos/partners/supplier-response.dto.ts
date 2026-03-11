import { PartnerStatus } from "../../../core/domain/enums/partners-status.enum";

export class SupplierResponseDto {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    status: PartnerStatus;
}
