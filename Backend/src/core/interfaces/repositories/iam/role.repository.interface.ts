import { Role } from "../../../domain/entities/iam/role.entity";
import { IBaseRepository } from "../base.repository.interface";

export interface IRoleRepository extends IBaseRepository<Role>{
    findByCode(code:string):Promise<Role|null>;
    findByName(name:string):Promise<Role|null>;

}