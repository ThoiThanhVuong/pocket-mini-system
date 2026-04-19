import { IBaseRepository } from '../base.repository.interface';
import { User } from '../../../domain/entities/iam/user.entity';
import { Email } from '../../../domain/value-objects/email.value-object';
import { IPaginationOptions, IPaginatedResult } from "../../../../shared/types/pagination.type";

export interface IUserRepository extends IBaseRepository<User> {
    findByEmail(email: Email): Promise<User | null>;
    findByPhoneNumber(phoneNumber: string): Promise<User | null>;
    save(user: User): Promise<User>;
    findAllWithFilters(search?: string, role?: string, status?: string, options?: IPaginationOptions): Promise<IPaginatedResult<User>>;
}
