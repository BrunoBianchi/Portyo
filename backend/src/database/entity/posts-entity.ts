import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity"
import { UserEntity } from "./user-entity";
import { BioEntity } from "./bio-entity";
import { AutoPostLogEntity } from "./auto-post-log-entity";


@Entity()
export class PostEntity extends BaseEntity {

    
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

@Column({ type: "varchar", nullable: true, unique: true })
slug!: string | null;

@ManyToOne(() => UserEntity, (user) => user.posts)
user!: UserEntity;

@ManyToOne(() => BioEntity, (bio) => bio.posts)
bio!: BioEntity;

@OneToMany(() => AutoPostLogEntity, (log) => log.post)
autoPostLogs!: AutoPostLogEntity[];

}