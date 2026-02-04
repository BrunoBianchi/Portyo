import { BeforeInsert, Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";
import { PostEntity } from "./posts-entity";
import * as bcrypt from "bcrypt";
import { QRCodeEntity } from "./qrcode-entity";
import { BillingEntity } from "./billing-entity";
import { AutoPostScheduleEntity } from "./auto-post-schedule-entity";
import { SiteAutoPostScheduleEntity } from "./site-auto-post-schedule-entity";


@Entity()
export class UserEntity extends BaseEntity {

    @Column({ type: "varchar" })
    fullName!: string;


    @Column({ unique: true, type: "varchar" })
    email!: string;

    @Column({ type: "varchar" })
    password!: string;
    @BeforeInsert()
    hashPassword() {
        this.password = bcrypt.hashSync(this.password, 10);
    }

    @Column({type:"varchar"})
    provider!:string;

    @Column({type:"boolean"})
    verified!:boolean;
    @BeforeInsert()
    VerifyProvider() {
        this.verified = this.provider != "password"?true:false
    }

    @Column({ type: "varchar", default: "free" })
    plan: string = "free";

    @Column({ type: "int", default: 0 })
    emailsSentThisMonth: number = 0;

    @Column({ type: "varchar", nullable: true })
    emailsLastResetMonth?: string; // Format: "YYYY-MM"

    @Column({ type: "boolean", default: false })
    isBanned: boolean = false;

    @Column({ type: "timestamp", nullable: true })
    planExpiresAt?: Date;

    @Column({ type: "timestamp", nullable: true })
    planExpirationEmailSentAt?: Date;

    @Column({ type: "boolean", default: false })
    onboardingCompleted: boolean = false;

    @Column({ type: "timestamp", nullable: true })
    onboardingNudgeSentAt?: Date;

    @OneToMany(() => BioEntity, (bio) => bio.user)
    bios!: BioEntity[];


    @OneToMany(() => PostEntity, (post) => post.user)
    posts!: PostEntity[];

    @OneToMany(() => BillingEntity, (billing) => billing.user)
    billings!: BillingEntity[];

    @OneToMany(() => AutoPostScheduleEntity, (schedule) => schedule.user)
    autoPostSchedules!: AutoPostScheduleEntity[];

    @OneToMany(() => SiteAutoPostScheduleEntity, (schedule) => schedule.user)
    siteAutoPostSchedules!: SiteAutoPostScheduleEntity[];
}