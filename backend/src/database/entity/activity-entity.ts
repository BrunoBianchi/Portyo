import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";

export enum ActivityType {
    PURCHASE = "PURCHASE",
    SUBSCRIBE = "SUBSCRIBE",
    VIEW = "VIEW",
    CLICK = "CLICK",
    LEAD = "LEAD"
}

@Entity()
export class ActivityEntity extends BaseEntity {
    @Column({ type: "enum", enum: ActivityType })
    type!: ActivityType;

    @Column({ type: "varchar" })
    description!: string;

    @Column({ type: "jsonb", nullable: true })
    metadata: any;

    @ManyToOne(() => BioEntity, { onDelete: "CASCADE" })
    @JoinColumn()
    bio!: BioEntity;

    @Column()
    bioId!: string;
}
