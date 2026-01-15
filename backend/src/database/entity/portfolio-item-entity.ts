import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";
import { PortfolioCategoryEntity } from "./portfolio-category-entity";

@Entity("portfolio_items")
export class PortfolioItemEntity extends BaseEntity {

    @Column({ type: "varchar" })
    title!: string;

    @Column({ type: "text", nullable: true })
    description: string | null = null;

    @Column({ type: "jsonb", default: [] })
    images: string[] = [];

    @Column({ type: "int", default: 0 })
    order: number = 0;

    @Column({ type: "uuid" })
    bioId!: string;

    @ManyToOne(() => BioEntity, (bio) => bio.portfolioItems, { onDelete: "CASCADE" })
    @JoinColumn({ name: "bioId" })
    bio!: BioEntity;

    @Column({ type: "uuid", nullable: true })
    categoryId: string | null = null;

    @ManyToOne(() => PortfolioCategoryEntity, (cat) => cat.items, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: "categoryId" })
    category: PortfolioCategoryEntity | null = null;
}

