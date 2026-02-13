import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";

@Entity()
export class ShortUrlEntity extends BaseEntity {
    @Column({ type: "varchar", length: 120 })
    title!: string;

    @Column({ type: "varchar", length: 120 })
    slug!: string;

    @Column({ type: "text" })
    destinationUrl!: string;

    @Column({ type: "int", default: 0 })
    clicks: number = 0;

    @Column({ type: "boolean", default: true })
    isActive: boolean = true;

    @Column({ type: "timestamp", nullable: true })
    lastClickedAt?: Date;

    @ManyToOne(() => BioEntity, (bio) => bio.shortUrls, { onDelete: "CASCADE" })
    bio!: BioEntity;
}
