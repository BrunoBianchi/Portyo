import { Column, Entity, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";

@Entity()
@Index(["bioId", "createdAt"])
export class PageViewEntity extends BaseEntity {
    @ManyToOne(() => BioEntity, { onDelete: "CASCADE" })
    @JoinColumn()
    bio!: BioEntity;

    @Column({ type: "uuid" })
    bioId!: string;

    // Type of interaction
    @Column({ type: "varchar", default: "view" })
    type!: "view" | "click";

    // Geographic data
    @Column({ type: "varchar", length: 2, nullable: true })
    country?: string; // ISO 3166-1 alpha-2 (e.g., "BR", "US")

    @Column({ type: "varchar", nullable: true })
    city?: string;

    @Column({ type: "varchar", nullable: true })
    region?: string; // State/Province

    @Column({ type: "float", nullable: true })
    latitude?: number;

    @Column({ type: "float", nullable: true })
    longitude?: number;

    // Device/Browser info
    @Column({ type: "varchar", nullable: true })
    device?: string; // Mobile, Desktop, Tablet

    @Column({ type: "varchar", nullable: true })
    browser?: string;

    // Traffic source
    @Column({ type: "varchar", nullable: true })
    referrer?: string;

    // Session identifier (for unique visitors)
    @Column({ type: "varchar", nullable: true })
    sessionId?: string;
}
