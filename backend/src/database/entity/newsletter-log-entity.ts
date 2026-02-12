import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { UserEntity } from "./user-entity";

@Entity()
export class NewsletterLogEntity extends BaseEntity {

    @Column({ type: "uuid" })
    userId!: string;

    @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: UserEntity;

    @Column({ type: "varchar" })
    templateId!: string;

    @Column({ type: "varchar" })
    emailSubject!: string;

    @Column({ type: "varchar", default: "sent" })
    status: string = "sent"; // 'sent' | 'failed'
}
