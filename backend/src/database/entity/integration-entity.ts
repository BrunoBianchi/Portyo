import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";

@Entity()
export class IntegrationEntity extends BaseEntity {

    @Column({ type: "varchar", nullable: false })
    account_id?: string;

    @Column({ type: "varchar", nullable: false })
    name?: string;

    @ManyToOne(() =>BioEntity, (bio) => bio.integrations)
    bio!:BioEntity;
}