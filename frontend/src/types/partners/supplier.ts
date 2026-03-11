import { PartnerStatus } from './customer';

export interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    status: PartnerStatus;
    createdAt?: string;
}
