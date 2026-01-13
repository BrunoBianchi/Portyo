import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base-entity";
import { FormEntity } from "./form-entity";

@Entity()
export class FormAnswerEntity extends BaseEntity {

    @Column({ type: "uuid" })
    formId!: string;

    @ManyToOne(() => FormEntity, (form) => form.answers)
    @JoinColumn({ name: "formId" })
    form!: FormEntity;

    @Column({ type: "jsonb" })
    answers: any;

    @Column({ type: "varchar", nullable: true })
    ipAddress: string | null = null;

    @Column({ type: "varchar", nullable: true })
    userAgent: string | null = null;
}
