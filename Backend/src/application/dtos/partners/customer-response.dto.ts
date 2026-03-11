import { PartnerStatus } from '../../../core/domain/enums/partners-status.enum';

export class CustomerResponseDto {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: PartnerStatus;
    customerType: string;
    companyName?: string;
    loyaltyTier?: string;
    totalOrders?: number;
    totalSpent?: number;
}