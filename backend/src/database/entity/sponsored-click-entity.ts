import { Column, Entity, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "./base-entity";
import { SponsoredAdoptionEntity } from "./sponsored-adoption-entity";
import { SponsoredOfferEntity } from "./sponsored-offer-entity";

@Entity("sponsored_clicks")
@Index(["adoptionId", "ipHash", "createdAt"])
@Index(["ipHash", "createdAt"])
export class SponsoredClickEntity extends BaseEntity {

    @Column({ type: "uuid" })
    adoptionId!: string;

    @ManyToOne(() => SponsoredAdoptionEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "adoptionId" })
    adoption!: SponsoredAdoptionEntity;

    @Column({ type: "uuid" })
    offerId!: string;

    @ManyToOne(() => SponsoredOfferEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "offerId" })
    offer!: SponsoredOfferEntity;

    @Column({ type: "varchar" })
    ipHash!: string;

    @Column({ type: "varchar", nullable: true })
    fingerprint?: string;

    @Column({ type: "varchar", nullable: true })
    country?: string;

    @Column({ type: "varchar", nullable: true })
    city?: string;

    @Column({ type: "varchar", nullable: true })
    device?: string;

    @Column({ type: "varchar", nullable: true })
    browser?: string;

    @Column({ type: "varchar", nullable: true })
    referrer?: string;

    @Column({ type: "decimal", precision: 10, scale: 4, default: 0 })
    earnedAmount: number = 0;

    @Column({ type: "boolean", default: true })
    isValid: boolean = true;

    @Column({ type: "varchar", nullable: true })
    sessionId?: string;

    @Column({ type: "varchar", nullable: true })
    invalidReason?: string;
}
