export class UserResponseDto {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string | null;
    status: string;
    baseSalary?: number;
    salaryType?: string;
    roles: {
        id: string;
        roleCode: string;
        name: string;
        baseSalary?: number;
        salaryType?: string;
    }[]; // Array of role objects with roleCode
    permissions: string[];
    warehouseIds?: string[];
}
