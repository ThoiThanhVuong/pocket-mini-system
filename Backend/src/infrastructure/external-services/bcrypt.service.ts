import { Injectable } from "@nestjs/common";
import { IHashingService } from "../../core/interfaces/services/iam/hashing.service.interface";
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService implements IHashingService {
    async hash(data: string): Promise<string> {
        const salt =await bcrypt.genSalt(10);
        return bcrypt.hash(data, salt);
    }
    async compare(data: string, encrypted: string): Promise<boolean> {
        return bcrypt.compare(data, encrypted);
    }
}