import { Column, Entity, ManyToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";

@Entity()
export class EmailEntity extends BaseEntity {
    @Column({ type: "varchar" })
    email!:string;

    @ManyToMany(() => BioEntity, (bio) => bio.emails)
    bios!: BioEntity[];
}