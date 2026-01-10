import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base-entity";
import { UserEntity } from "./user-entity";

@Entity("billings")
export class BillingEntity extends BaseEntity {

    @Column({ type: "varchar" })
    plan!: 'standard' | 'pro';

    @Column({ type: "float" })
    price!: number;

    @Column({ type: "timestamp" })
    startDate!: Date;

    @Column({ type: "timestamp" })
    endDate!: Date;

    @Column({ type: "varchar" })
    userId!: string;

    @ManyToOne(() => UserEntity, user => user.billings)
    @JoinColumn({ name: "userId" })
    user!: UserEntity;
}
