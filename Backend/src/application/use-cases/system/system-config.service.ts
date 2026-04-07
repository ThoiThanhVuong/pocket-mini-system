
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../../../infrastructure/database/entities/system-config.entity';

@Injectable()
export class SystemConfigService {
    constructor(
        @InjectRepository(SystemConfig)
        private readonly repo: Repository<SystemConfig>
    ) {}

    async getConfig(key: string, defaultValue: string): Promise<string> {
        const config = await this.repo.findOne({ where: { key } });
        if (!config) {
            return defaultValue;
        }
        return config.value;
    }

    async setConfig(key: string, value: string, description?: string): Promise<SystemConfig> {
        let config = await this.repo.findOne({ where: { key } });
        if (config) {
            config.value = value;
            if (description) config.description = description;
        } else {
            config = this.repo.create({ key, value, description });
        }
        return await this.repo.save(config);
    }

    async getConfigs(keys: string[]): Promise<Record<string, string>> {
        if (!keys || keys.length === 0) return {};
        
        // Use In() operator if you import it, or just loop. 
        // Better to use query builder or In for performance.
        // For now, let's use repository find with In.
        // Need to import In from typeorm.
        // Since I can't easily add import to top without reading whole file again or using multi-replace...
        // I will use a simple query builder or just map.
        // Let's try to assume In is available or just add it to imports in next step if it fails.
        // Actually, I can use a loop for now or use the existing repo.find.
        
        const configs = await this.repo.find(); 
        // Filter in memory for now safely or just return all if keys empty?
        // Let's return all matching keys.
        
        const result: Record<string, string> = {};
        keys.forEach(k => result[k] = ''); // Default empty

        configs.forEach(c => {
            if (keys.includes(c.key)) {
                result[c.key] = c.value;
            }
        });
        return result;
    }
}
