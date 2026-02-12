import { Column, Entity, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "./base-entity";
import { CompanyEntity } from "./company-entity";

@Entity("sponsored_offers")
export class SponsoredOfferEntity extends BaseEntity {

    @Column({ type: "uuid" })
    companyId!: string;

    @ManyToOne(() => CompanyEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "companyId" })
    company!: CompanyEntity;

    @Column({ type: "varchar", length: 150 })
    title!: string;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "varchar" })
    linkUrl!: string;

    @Column({ type: "varchar", nullable: true })
    imageUrl?: string;

    @Column({ type: "varchar", default: "other" })
    category: string = "other";

    @Column({ type: "decimal", precision: 10, scale: 4 })
    cpcRate!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    dailyBudget?: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    totalBudget?: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    totalSpent: number = 0;

    @Column({ type: "numeric", default: 0 })
    totalClicks: number = 0;

    @Column({ type: "numeric", default: 0 })
    totalImpressions: number = 0;

    @Column({ type: "varchar", default: "active" })
    status: string = "active"; // active | paused | exhausted | expired

    @Column({ type: "timestamp", nullable: true })
    startsAt?: Date;

    @Column({ type: "timestamp", nullable: true })
    expiresAt?: Date;

    @Column({ type: "simple-array", nullable: true })
    targetCountries?: string[];

    @Column({ type: "varchar", default: "any" })
    minBioTier: string = "any"; // any | starter | growing | established

    @Column({ type: "varchar", nullable: true })
    backgroundColor?: string;

    @Column({ type: "varchar", nullable: true })
    textColor?: string;

    @Column({ type: "varchar", default: "card" })
    layout: string = "card"; // card | banner | compact
}
