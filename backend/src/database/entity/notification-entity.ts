import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { UserEntity } from "./user-entity";
import { BioEntity } from "./bio-entity";

export enum NotificationType {
    ACHIEVEMENT = "achievement",
    LEAD = "lead",
    BOOKING = "booking",
    SALE = "sale",
    ANNOUNCEMENT = "announcement",
    UPDATE = "update"
}

@Entity()
export class NotificationEntity extends BaseEntity {

    @Column({ type: "varchar" })
    title!: string;

    @Column({ type: "text" })
    message!: string;

    @Column({
        type: "enum",
        enum: NotificationType,
        default: NotificationType.UPDATE
    })
    type!: NotificationType;

    @Column({ type: "varchar", default: "Bell" })
    icon: string = "Bell";

    @Column({ type: "boolean", default: false })
    isRead: boolean = false;

    @Column({ type: "varchar", nullable: true })
    link: string | null = null;

    @Column({ type: "jsonb", nullable: true })
    metadata: any = null;

    @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: UserEntity;

    @Column({ type: "uuid" })
    userId!: string;

    @ManyToOne(() => BioEntity, { onDelete: "CASCADE", nullable: true })
    @JoinColumn({ name: "bioId" })
    bio?: BioEntity;

    @Column({ type: "uuid", nullable: true })
    bioId?: string;
}
