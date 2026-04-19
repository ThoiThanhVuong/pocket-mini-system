import { IBaseRepository } from "../base.repository.interface";
import { Customer } from "../../../domain/entities/partners/customer.entity";
import { Email } from "../../../domain/value-objects/email.value-object";
import { IPaginationOptions, IPaginatedResult } from "../../../../shared/types/pagination.type";

export interface ICustomerRepository extends IBaseRepository<Customer>{
    findByEmail(email:Email):Promise<Customer|null>;
    save(customer:Customer):Promise<Customer>;
    findAllWithFilters(search?:string,status?:string,customerType?:string, options?: IPaginationOptions):Promise<IPaginatedResult<Customer>>;
}