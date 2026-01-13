import { BaseType } from "./base.type";
import { UserType } from "./user.type";
import { Bio } from "./bio.type";

export type Post = BaseType & {
    title: string;
    thumbnail?: string | null;
    content: string;
    keywords: string;
    views: number;
    status: string;
    scheduledAt: Date | null;
    user: UserType | string;
    bio: Bio | string;
}
