import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base-entity"
import { UserEntity } from "./user-entity";
import { BioEntity } from "./bio-entity";


@Entity()
export class PostEntity extends BaseEntity {

    
@Column()
title!:string;

@Column()
content!:string;

@Column()
keywords!:string;

@Column()
views:number = 0;

@Column()
status!:string;

@Column({ type: "timestamp", nullable: true })
scheduledAt!: Date | null;

@ManyToOne(() => UserEntity, (user) => user.posts)
user!: UserEntity;

@ManyToOne(() => BioEntity, (bio) => bio.posts)
bio!: BioEntity;

}