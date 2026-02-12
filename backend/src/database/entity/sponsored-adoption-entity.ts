import { Column, Entity, ManyToOne, JoinColumn, Unique } from "typeorm";
import { BaseEntity } from "./base-entity";
import { UserEntity } from "./user-entity";
import { BioEntity } from "./bio-entity";
import { SponsoredOfferEntity } from "./sponsored-offer-entity";

@Entity("sponsored_adoptions")
@Unique(["userId", "offerId"])
export class SponsoredAdoptionEntity extends BaseEntity {

    @Column({ type: "uuid" })
    userId!: string;

    @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: UserEntity;

    @Column({ type: "uuid" })
    bioId!: string;

    @ManyToOne(() => BioEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "bioId" })
    bio!: BioEntity;

    @Column({ type: "uuid" })
    offerId!: string;

    @ManyToOne(() => SponsoredOfferEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "offerId" })
    offer!: SponsoredOfferEntity;

    @Column({ type: "varchar", unique: true })
    trackingCode!: string;

    @Column({ type: "varchar", default: "active" })
    status: string = "active"; // active | paused | removed

    @Column({ type: "numeric", default: 0 })
    totalClicks: number = 0;

    @Column({ type: "decimal", precision: 10, scale: 4, default: 0 })
    totalEarnings: number = 0;

    @Column({ type: "numeric", default: 0 })
    position: number = 0;
}
