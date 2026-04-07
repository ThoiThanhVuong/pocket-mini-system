import { CreateUserDto } from "../dtos/iam/create-user.dto";
import { UserResponseDto } from "../dtos/iam/user-response.dto";
import { User } from "../../core/domain/entities/iam/user.entity";
import { Email } from "../../core/domain/value-objects/email.value-object";
import { v4 as uuidv4 } from 'uuid';

export class UserMapper {
    static toDomain(dto: CreateUserDto, passwordHash: string): User {
        return new User(
            uuidv4(),
            new Email(dto.email),
            dto.phoneNumber || null, 
            dto.fullName,
            passwordHash
        );
    }

    static toResponse(user: User): UserResponseDto {
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            status: user.status,
            baseSalary: Number(user.baseSalary) || 0,
            salaryType: user.salaryType,
            roles: (user.roles || []).map(role => ({
                id: role.id,
                roleCode: role.roleCode,
                name: role.name,
                baseSalary: Number(role.baseSalary) || 0,
                salaryType: role.salaryType
            })),
            permissions: (user.roles || []).flatMap(role => (role.permissions || []).map(p => p.permissionCode)),
            warehouseIds: user.warehouseIds || []
        };
    }
}
