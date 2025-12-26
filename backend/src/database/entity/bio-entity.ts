import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { UserEntity } from "./user-entity";

@Entity()
export class BioEntity extends BaseEntity {

    @Column({ type: "varchar" ,unique:true})
    sufix!: string;
    
    @Column({type:"jsonb", nullable: true})
    blocks: any;

    @Column({type:"text", nullable: true})
    html:string =``;

    @Column({type:"numeric"})
    views:number = 0;

    @Column({type:"numeric"})
    clicks:number = 0;

    @Column({ type: "varchar", default: "color" })
    bgType: string = "color";

    @Column({ type: "varchar", default: "#f8fafc" })
    bgColor: string = "#f8fafc";

    @Column({ type: "varchar", default: "#e2e8f0" })
    bgSecondaryColor: string = "#e2e8f0";

    @Column({ type: "varchar", nullable: true })
    bgImage: string | null = null;

    @Column({ type: "varchar", nullable: true })
    bgVideo: string | null = null;

    @Column({ type: "varchar", default: "#111827" })
    usernameColor: string = "#111827";

    @Column({ type: "varchar", default: "circle" })
    imageStyle: string = "circle";

    // Card/Container Styling
    @Column({ type: "varchar", default: "none" })
    cardStyle: string = "none"; // none, flat, shadow, outline, glass

    @Column({ type: "varchar", default: "#ffffff" })
    cardBackgroundColor: string = "#ffffff";

    @Column({ type: "varchar", default: "#e2e8f0" })
    cardBorderColor: string = "#e2e8f0";

    @Column({ type: "numeric", default: 0 })
    cardBorderWidth: number = 0;

    @Column({ type: "numeric", default: 16 })
    cardBorderRadius: number = 16;

    @Column({ type: "varchar", default: "none" })
    cardShadow: string = "none"; // none, sm, md, lg, xl, 2xl

    @Column({ type: "numeric", default: 24 })
    cardPadding: number = 24;

    @Column({ type: "numeric", default: 640 })
    maxWidth: number = 640;

    @Column({ type: "varchar", nullable: true })
    seoTitle: string | null = null;

    @Column({ type: "text", nullable: true })
    seoDescription: string | null = null;

    @Column({ type: "varchar", nullable: true })
    favicon: string | null = null;

    @Column({ type: "varchar", nullable: true })
    googleAnalyticsId: string | null = null;

    @Column({ type: "varchar", nullable: true })
    facebookPixelId: string | null = null;

    @Column({ type: "text", nullable: true })
    seoKeywords: string | null = null;

    @Column({ type: "varchar", nullable: true })
    ogTitle: string | null = null;

    @Column({ type: "text", nullable: true })
    ogDescription: string | null = null;

    @Column({ type: "varchar", nullable: true })
    ogImage: string | null = null;

    @Column({ type: "boolean", default: false })
    noIndex: boolean = false;

    @Column({ type: "varchar", nullable: true, unique: true })
    customDomain: string | null = null;

    @ManyToOne(() => UserEntity, (user) => user.bios)
    @JoinColumn({ name: "userId" })
    user!: UserEntity;

    @Column({ type: "uuid" })
    userId!: string;

}