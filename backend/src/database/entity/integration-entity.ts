import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";

@Entity()
export class IntegrationEntity extends BaseEntity {

    @Column({ type: "varchar", nullable: false })
    account_id?: string;

    @Column({ type: "varchar", nullable: false })
    name?: string;

    @Column({ type: "varchar", nullable: true })
    provider?: string;

    @Column({ type: "text", nullable: true })
    accessToken?: string;

    @Column({ type: "text", nullable: true })
    refreshToken?: string;

    @ManyToOne(() =>BioEntity, (bio) => bio.integrations)
    bio!:BioEntity;
}