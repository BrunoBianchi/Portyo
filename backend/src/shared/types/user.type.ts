import { BaseType } from "./base.type";
export type UserType = BaseType & {
    fullName: string;
    email: string;
    password: string;
}