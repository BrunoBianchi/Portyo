import { BeforeInsert, Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import * as bcrypt from "bcrypt";

@Entity("companies")
export class CompanyEntity extends BaseEntity {

    @Column({ type: "varchar" })
    companyName!: string;

    @Column({ unique: true, type: "varchar" })
    email!: string;

    @Column({ type: "varchar" })
    password!: string;

    @BeforeInsert()
    hashPassword() {
        this.password = bcrypt.hashSync(this.password, 10);
    }

    @Column({ type: "varchar", nullable: true })
    logo?: string;

    @Column({ type: "varchar", nullable: true })
    website?: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    @Column({ type: "varchar", nullable: true })
    industry?: string;

    @Column({ type: "boolean", default: false })
    verified: boolean = false;

    @Column({ type: "boolean", default: false })
    isBanned: boolean = false;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    balance: number = 0;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    totalSpent: number = 0;
}
