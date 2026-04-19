import { Email } from "../../../domain/value-objects/email.value-object";
import { Supplier } from "../../../domain/entities/partners/supplier.entity";
import { IBaseRepository } from "../base.repository.interface";
import { IPaginationOptions, IPaginatedResult } from "../../../../shared/types/pagination.type";

export interface ISupplierRepository extends IBaseRepository<Supplier>{
    findByEmail(email:Email):Promise<Supplier|null>;
    save(supplier:Supplier):Promise<Supplier>;
    findAllWithFilters(search?:string,status?:string, options?: IPaginationOptions):Promise<IPaginatedResult<Supplier>>;
}