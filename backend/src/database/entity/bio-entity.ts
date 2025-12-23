import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { UserEntity } from "./user-entity";

@Entity()
export class BioEntity extends BaseEntity {

    @Column({ type: "varchar" ,unique:true})
    sufix!: string;
    
    @Column({type:"jsonb"})
    html:string =``;

    @Column({type:"numeric"})
    views:number = 0;

    @Column({type:"numeric"})
    clicks:number = 0;

    @ManyToOne(() => UserEntity, (user) => user.bios)
    @JoinColumn({ name: "userId" })
    user!: UserEntity;

    @Column({ type: "uuid" })
    userId!: string;

}