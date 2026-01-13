import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";
import { FormAnswerEntity } from "./form-answer-entity";

@Entity()
export class FormEntity extends BaseEntity {

    @Column({ type: "varchar" })
    title!: string;

    @Column({ type: "text", nullable: true })
    description: string | null = null;

    @Column({ type: "jsonb", default: [] })
    fields: any[] = [];

    @Column({ type: "varchar", default: "Submit" })
    submitButtonText: string = "Submit";

    @Column({ type: "text", default: "Thank you for your submission!" })
    successMessage: string = "Thank you for your submission!";

    @Column({ type: "boolean", default: true })
    isActive: boolean = true;

    @Column({ type: "int", default: 0 })
    views: number = 0;

    @Column({ type: "int", default: 0 })
    submissions: number = 0;

    @Column({ type: "uuid" })
    bioId!: string;

    @ManyToOne(() => BioEntity, (bio) => bio.forms)
    @JoinColumn({ name: "bioId" })
    bio!: BioEntity;

    @OneToMany(() => FormAnswerEntity, (answer) => answer.form)
    answers!: FormAnswerEntity[];
}
