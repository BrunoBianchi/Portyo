import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";

@Entity("portfolio_items")
export class PortfolioItemEntity extends BaseEntity {

    @Column({ type: "varchar" })
    title!: string;

    @Column({ type: "text", nullable: true })
    description: string | null = null;

    @Column({ type: "varchar", nullable: true })
    image: string | null = null;

    @Column({ type: "int", default: 0 })
    order: number = 0;

    @Column({ type: "uuid" })
    bioId!: string;

    @ManyToOne(() => BioEntity, (bio) => bio.portfolioItems, { onDelete: "CASCADE" })
    @JoinColumn({ name: "bioId" })
    bio!: BioEntity;
}
