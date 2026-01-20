import { Column, Entity, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable, OneToOne } from "typeorm";
import { BaseEntity } from "./base-entity";
import { UserEntity } from "./user-entity";
import { PostEntity } from "./posts-entity";
import { QRCodeEntity } from "./qrcode-entity";
import { EmailEntity } from "./email-entity";
import { IntegrationEntity } from "./integration-entity";
import { EmailTemplateEntity } from "./email-template-entity";
import { BookingSettingsEntity } from "./booking-settings-entity";
import { BookingEntity } from "./booking-entity";
import { FormEntity } from "./form-entity";
import { PortfolioItemEntity } from "./portfolio-item-entity";

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

    @Column({ type: "boolean", default: true })
    displayProfileImage: boolean = true;

    @Column({ type: "varchar", nullable: true })
    profileImage: string | null = null;

    @Column({ type: "text", nullable: true })
    description: string | null = null;

    @Column({ type: "jsonb", nullable: true })
    socials: {
        instagram?: string;
        tiktok?: string;
        twitter?: string;
        youtube?: string;
        linkedin?: string;
        email?: string;
        website?: string;
        github?: string;
    } | null = null;

    // Card/Container Styling
    @Column({ type: "varchar", default: "none" })
    cardStyle: string = "none"; // none, flat, shadow, outline, glass

    @Column({ type: "varchar", default: "#ffffff" })
    cardBackgroundColor: string = "#ffffff";

    @Column({ type: "numeric", default: 100 })
    cardOpacity: number = 100;

    @Column({ type: "numeric", default: 10 })
    cardBlur: number = 10;

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

    @Column({ type: "boolean", default: false })
    enableSubscribeButton: boolean = false;

    @Column({ type: "varchar", nullable: true, unique: true })
    customDomain: string | null = null;
    
    @Column({ type: "boolean", default: false })
    removeBranding: boolean = false;

    @Column({ type: "varchar", default: "Inter" })
    font: string = "Inter";

    @Column({ type: "varchar", nullable: true })
    customFontUrl: string | null = null;

    @Column({ type: "varchar", nullable: true })
    customFontName: string | null = null;

    @Column({ type: "boolean", default: false })
    verified: boolean = false;

    // Parallax & Floating Effects
    @Column({ type: "boolean", default: false })
    enableParallax: boolean = false;

    @Column({ type: "numeric", default: 50 })
    parallaxIntensity: number = 50;

    @Column({ type: "numeric", default: 50 })
    parallaxDepth: number = 50;

    @Column({ type: "varchar", default: "y" })
    parallaxAxis: string = "y";

    @Column({ type: "jsonb", nullable: true })
    parallaxLayers: any[] | null = null;

    @Column({ type: "boolean", default: false })
    floatingElements: boolean = false;

    @Column({ type: "varchar", default: "circles" })
    floatingElementsType: string = "circles"; // circles, hearts, fire, stars, sparkles, music, leaves, snow, bubbles, confetti, diamonds, petals, emojis

    @Column({ type: "varchar", default: "#ffffff" })
    floatingElementsColor: string = "#ffffff";

    @Column({ type: "numeric", default: 12 })
    floatingElementsDensity: number = 12;

    @Column({ type: "numeric", default: 24 })
    floatingElementsSize: number = 24;

    @Column({ type: "numeric", default: 12 })
    floatingElementsSpeed: number = 12;

    @Column({ type: "numeric", default: 0.35 })
    floatingElementsOpacity: number = 0.35;

    @Column({ type: "numeric", default: 0 })
    floatingElementsBlur: number = 0;

    @Column({ type: "varchar", nullable: true })
    customFloatingElementText: string | null = null;

    @Column({ type: "varchar", nullable: true })
    customFloatingElementImage: string | null = null;



    @ManyToOne(() => UserEntity, (user) => user.bios, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: UserEntity;

    @Column({ type: "uuid" })
    userId!: string;

    @OneToMany(() => PostEntity, (post) => post.bio)
    posts!: PostEntity[];

    @OneToMany(() => QRCodeEntity, (qrcode) => qrcode.bio)
    qrcodes!: QRCodeEntity[];

    @ManyToMany(() => EmailEntity, (email) => email.bios)
    @JoinTable()
    emails!: EmailEntity[];

    @OneToMany(() => IntegrationEntity, (integration) => integration.bio)
    integrations!: IntegrationEntity[];

    @OneToMany(() => EmailTemplateEntity, (template) => template.bio)
    emailTemplates!: EmailTemplateEntity[];

    @OneToOne(() => BookingSettingsEntity, (settings) => settings.bio)
    bookingSettings!: BookingSettingsEntity;

    @OneToMany(() => BookingEntity, (booking) => booking.bio)
    bookings!: BookingEntity[];

    @OneToMany(() => FormEntity, (form) => form.bio)
    forms!: FormEntity[];

    @OneToMany(() => PortfolioItemEntity, (item) => item.bio)
    portfolioItems!: PortfolioItemEntity[];
}