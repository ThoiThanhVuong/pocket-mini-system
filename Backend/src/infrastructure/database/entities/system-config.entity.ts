
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('system_config')
export class SystemConfig {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    key: string;

    @Column()
    value: string;

    @Column({ nullable: true })
    description: string;
}
