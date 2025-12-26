import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity"


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


}