import { IBaseRepository } from '../base.repository.interface';
import { User } from '../../../domain/entities/iam/user.entity';
import { Email } from '../../../domain/value-objects/email.value-object';

export interface IUserRepository extends IBaseRepository<User> {
    findByEmail(email: Email): Promise<User | null>;
    findByPhoneNumber(phoneNumber: string): Promise<User | null>;
    save(user: User): Promise<User>;
    findAllWithFilters(search?: string, role?: string, status?: string): Promise<User[]>;
}
