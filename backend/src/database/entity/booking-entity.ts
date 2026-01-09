import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";

export enum BookingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    COMPLETED = "completed"
}

@Entity()
export class BookingEntity extends BaseEntity {

    @ManyToOne(() => BioEntity)
    @JoinColumn({ name: "bioId" })
    bio!: BioEntity;

    @Column({ type: "uuid" })
    bioId!: string;

    @Column({ type: "varchar" })
    customerName!: string;

    @Column({ type: "varchar" })
    customerEmail!: string;

    @Column({ type: "varchar", nullable: true })
    customerPhone: string | null = null;

    @Column({ type: "timestamp" })
    bookingDate!: Date; // The start time of the slot

    @Column({ type: "enum", enum: BookingStatus, default: BookingStatus.PENDING })
    status: BookingStatus = BookingStatus.PENDING;

    @Column({ type: "varchar", nullable: true })
    confirmationToken: string | null = null;

    @Column({ type: "text", nullable: true })
    cancellationReason: string | null = null;

    @Column({ type: "text", nullable: true })
    notes: string | null = null;

    @Column({ type: "varchar", nullable: true })
    googleCalendarEventId: string | null = null;
}
