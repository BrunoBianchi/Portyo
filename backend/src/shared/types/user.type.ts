import { BaseType } from "./base.type";
export type UserType = BaseType & {
    id: string;
    fullName: string;
    email: string;
    password: string;
    sufix:string;
}