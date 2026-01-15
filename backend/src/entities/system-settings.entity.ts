import { Entity, Column, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('system_settings')
export class SystemSettings {
    @PrimaryColumn({ type: 'varchar' })
    key!: string;

    @Column({ type: 'jsonb', nullable: true })
    value: any;

    @UpdateDateColumn()
    updatedAt!: Date;
}
