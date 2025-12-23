import { BaseType } from "./base.type";
import { UserType } from "./user.type";

export type Bio = BaseType & {
    sufix:string;
    clicks:number;
    views:number;
    user:UserType | string;
}