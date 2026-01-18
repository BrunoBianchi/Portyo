import { BaseType } from "./base.type";
import { Bio } from "./bio.type";
export type UserType = BaseType & {
    fullName: string;
    email: string;
    password: string;
    provider:string;
    verified:boolean;
    plan:string;
    onboardingCompleted:boolean;
    onboardingNudgeSentAt?: Date;
}