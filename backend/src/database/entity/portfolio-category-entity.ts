import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";
import { PortfolioItemEntity } from "./portfolio-item-entity";

@Entity("portfolio_categories")
export class PortfolioCategoryEntity extends BaseEntity {

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "int", default: 0 })
    order: number = 0;

    @Column({ type: "uuid" })
    bioId!: string;

    @ManyToOne(() => BioEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "bioId" })
    bio!: BioEntity;

    @OneToMany(() => PortfolioItemEntity, (item) => item.category)
    items!: PortfolioItemEntity[];
}
