import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";

@Entity()
export class EmailTemplateEntity extends BaseEntity {

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "jsonb", default: [] })
    content: any; // JSON structure for the drag & drop editor

    @Column({ type: "text", nullable: true })
    html: string | null = null; // Compiled HTML for sending

    @ManyToOne(() => BioEntity, (bio) => bio.emailTemplates)
    @JoinColumn({ name: "bioId" })
    bio!: BioEntity;

    @Column({ type: "uuid" })
    bioId!: string;
}
