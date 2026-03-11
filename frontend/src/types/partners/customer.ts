export enum PartnerStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BLOCKED = 'blocked'
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: PartnerStatus;
    customerType: string;
    companyName?: string;
    totalOrders: number;
    totalSpent: number;
    loyaltyTier: string;
}
