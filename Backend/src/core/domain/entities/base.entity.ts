export abstract class BaseEntity {
    protected _id: string;
    protected _createdAt: Date;
    protected _updatedAt: Date;

    constructor(id: string, createdAt: Date = new Date(), updatedAt: Date = new Date()) {
        this._id = id;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    get id(): string {
        return this._id;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    public equals(object?: BaseEntity): boolean {
        if (object == null || object == undefined) {
            return false;
        }

        if (this === object) {
            return true;
        }

        if (!(object instanceof BaseEntity)) {
            return false;
        }

        return this._id === object._id;
    }
}
