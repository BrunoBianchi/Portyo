import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity";

export type ThemeCategory = 
    | "architecture" 
    | "programming" 
    | "onlyfans" 
    | "photography" 
    | "music" 
    | "fitness" 
    | "fashion" 
    | "art" 
    | "business" 
    | "gaming" 
    | "food" 
    | "travel";

export type ThemeTier = "free" | "standard" | "pro";

export interface ThemeStyles {
    bgType: string;
    bgColor: string;
    bgSecondaryColor: string;
    cardStyle: string;
    cardBackgroundColor: string;
    cardBorderColor: string;
    cardBorderWidth: number;
    cardBorderRadius: number;
    cardShadow: string;
    cardPadding: number;
    usernameColor: string;
    font: string;
    maxWidth: number;
}

@Entity()
export class ThemeEntity extends BaseEntity {
    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "varchar" })
    category!: ThemeCategory;

    @Column({ type: "varchar", default: "free" })
    tier!: ThemeTier;

    @Column({ type: "varchar", nullable: true })
    thumbnail: string | null = null;

    @Column({ type: "jsonb" })
    styles!: ThemeStyles;

    @Column({ type: "jsonb", nullable: true })
    sampleBlocks: any[] | null = null;

    @Column({ type: "numeric", default: 0 })
    usageCount: number = 0;

    @Column({ type: "boolean", default: true })
    isActive: boolean = true;

    @Column({ type: "varchar", nullable: true })
    emoji: string | null = null;
}
