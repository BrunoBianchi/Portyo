import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base-entity"
import { UserEntity } from "./user-entity";


@Entity()
export class SitePostEntity extends BaseEntity {

    
@Column({ type: "text" })
title!:string;

@Column({ type: "text", nullable: true })
thumbnail!: string | null;

@Column({ type: "text" })
content!:string;

@Column({ type: "text" })
keywords!:string;

@Column({ type: "int", default: 0 })
views:number = 0;

@Column({ type: "text" })
status!:string;

@Column({ type: "timestamp", nullable: true })
scheduledAt!: Date | null;

@ManyToOne(() => UserEntity, (user) => user.posts)
user!: UserEntity;

}
