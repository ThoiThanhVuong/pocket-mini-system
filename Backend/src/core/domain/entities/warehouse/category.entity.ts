import { BaseEntity } from '../base.entity';
import { DomainException } from '../../../exceptions/domain.exception';

export class Category extends BaseEntity {
    private _name:string;
    private _description:string;
    private _image:string;
    private _level:number;
    private _parentId: string | null;

    constructor(id:string, name:string, description:string, image:string, level:number, parentId: string | null, createdAt:Date, updatedAt:Date){
        super(id,createdAt,updatedAt);
        this._name=name;
        this._description=description;
        this._image=image;
        this._level=level;
        this._parentId=parentId;
        this.validate();
    }

    private validate(): void {
        if (!this._name || this._name.length < 3) {
            throw new DomainException('Name must be at least 3 characters long.');
        }
    }

    get name():string{
        return this._name;
    }
    set name(value:string){
        this._name=value;
    }
    get description():string{
        return this._description;
    }
    set description(value:string){
        this._description=value;
    }
    get image():string{
        return this._image;
    }
    set image(value:string){
        this._image=value;
    }
    get level():number{
        return this._level;
    }
    set level(value:number){
        this._level=value;
    }
    get parentId(): string | null {
        return this._parentId;
    }
    set parentId(value: string | null) {
        this._parentId = value;
    }
}
