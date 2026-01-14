import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { UserEntity } from "./user-entity";

@Entity()
export class PasswordResetEntity extends BaseEntity {
    
    @Column({ type: "varchar", unique: true })
    token!: string;

    @Column({ type: "varchar" })
    userId!: string;

    @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: UserEntity;

    @Column({ type: "timestamp" })
    expiresAt!: Date;
}
