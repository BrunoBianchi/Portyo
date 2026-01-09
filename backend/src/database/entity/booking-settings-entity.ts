import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";

@Entity()
export class BookingSettingsEntity extends BaseEntity {

    @OneToOne(() => BioEntity)
    @JoinColumn({ name: "bioId" })
    bio!: BioEntity;

    @Column({ type: "uuid" })
    bioId!: string;

    @Column({ type: "boolean", default: false })
    updatesPaused: boolean = false; // "Pause" feature

    @Column({ type: "int", default: 30 })
    durationMinutes: number = 30; // e.g., 30 min slots

    // Availability Schema: { "mon": ["09:00-12:00", "13:00-17:00"], "tue": [...] }
    @Column({ type: "jsonb", default: {} })
    availability: any = {};

    @Column({ type: "jsonb", default: [] })
    blockedDates: string[] = []; // Array of ISO date strings "YYYY-MM-DD"
}
