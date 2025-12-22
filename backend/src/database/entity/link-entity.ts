import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity";

@Entity()

export class link extends BaseEntity {

    @Column({type:"varchar"})
    name!:string;

}