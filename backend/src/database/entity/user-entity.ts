import { BeforeInsert, Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";
import { PostEntity } from "./posts-entity";
import * as bcrypt from "bcrypt";
import { QRCodeEntity } from "./qrcode-entity";

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

    @OneToMany(() => BioEntity, (bio) => bio.user)
    bios!: BioEntity[];

    @OneToMany(() => PostEntity, (post) => post.user)
    posts!: PostEntity[];


}