import { DomainException } from "./domain.exception";

export class EntityNotFoundException extends DomainException{
    constructor(entityName:string,id:string|number) {
        super(`${entityName} not found with id ${id}`);
        this.name = "EntityNotFoundException";
    }
}