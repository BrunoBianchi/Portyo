import { BaseType } from "./base.type";
import { UserType } from "./user.type";

export type Bio = BaseType & {
    sufix:string;
    clicks:number;
    views:number;
    user:UserType | string;
    blocks?: any[];
    html?: string;
    seoTitle?: string;
    seoDescription?: string;
    favicon?: string;
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    seoKeywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    noIndex?: boolean;
}