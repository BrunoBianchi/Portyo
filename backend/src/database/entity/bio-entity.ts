import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { UserEntity } from "./user-entity";

@Entity()
export class BioEntity extends BaseEntity {

    @Column({ type: "varchar" ,unique:true})
    sufix!: string;
    
    @Column({type:"jsonb", nullable: true})
    blocks: any;

    @Column({type:"text", nullable: true})
    html:string =``;

    @Column({type:"numeric"})
    views:number = 0;

    @Column({type:"numeric"})
    clicks:number = 0;

    @Column({ type: "varchar", default: "color" })
    bgType: string = "color";

    @Column({ type: "varchar", default: "#f8fafc" })
    bgColor: string = "#f8fafc";

    @Column({ type: "varchar", default: "#e2e8f0" })
    bgSecondaryColor: string = "#e2e8f0";

    @Column({ type: "varchar", nullable: true })
    bgImage: string | null = null;

    @Column({ type: "varchar", nullable: true })
    bgVideo: string | null = null;

    @Column({ type: "varchar", default: "#111827" })
    usernameColor: string = "#111827";

    @Column({ type: "varchar", default: "circle" })
    imageStyle: string = "circle";

    @ManyToOne(() => UserEntity, (user) => user.bios)
    @JoinColumn({ name: "userId" })
    user!: UserEntity;

    @Column({ type: "uuid" })
    userId!: string;

}