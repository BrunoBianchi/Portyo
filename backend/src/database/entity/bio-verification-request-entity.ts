import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";

@Entity()
export class BioVerificationRequestEntity extends BaseEntity {
    @Column({ type: "uuid" })
    bioId!: string;

    @ManyToOne(() => BioEntity, (bio) => bio.verificationRequests, { onDelete: "CASCADE" })
    @JoinColumn({ name: "bioId" })
    bio!: BioEntity;

    @Column({ type: "uuid" })
    userId!: string;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "varchar" })
    email!: string;

    @Column({ type: "varchar" })
    phone!: string;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "varchar", default: "pending" })
    status!: "pending" | "approved" | "rejected";
}
