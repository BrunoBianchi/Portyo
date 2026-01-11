import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";


@Entity()
export class QRCodeEntity extends BaseEntity {

    @Column({ type: "text" })
    value!: string;

    @Column({ type: "int", default: 0 })
    clicks: number = 0;

    @Column({ type: "int", default: 0 })
    views: number = 0;

    @Column({ type: "text", nullable: true })
    country?: string;

    @Column({ type: "text", nullable: true })
    device?: string;

    @Column({ type: "timestamp", nullable: true })
    lastScannedAt?: Date;

    @ManyToOne(() => BioEntity, (bio) => bio.posts)
    bio!: BioEntity;
}