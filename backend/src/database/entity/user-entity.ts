import { BeforeInsert, Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity";
import * as bcrypt from "bcrypt";

@Entity()
export class UserEntity extends BaseEntity {

    @Column({ type: "varchar" })
    fullName!: string;

    @Column({ type: "varchar" })
    sufix!: string;

    @Column({ unique: true, type: "varchar" })
    email!: string;

    @Column({ type: "varchar" })
    password!: string;
    @BeforeInsert()
    hashPassword() {
        this.password = bcrypt.hashSync(this.password, 10);
    }



}