import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity";

export type SocialChannel = "instagram" | "facebook" | "linkedin" | "twitter";
export type SocialPlannerStatus = "draft" | "scheduled" | "published" | "failed" | "cancelled";

@Entity()
export class SocialPlannerPostEntity extends BaseEntity {
    @Column({ type: "uuid" })
    userId!: string;

    @Column({ type: "uuid" })
    bioId!: string;

    @Column({ type: "varchar" })
    channel!: SocialChannel;

    @Column({ type: "varchar", default: "draft" })
    status!: SocialPlannerStatus;

    @Column({ type: "varchar", nullable: true })
    title!: string | null;

    @Column({ type: "text" })
    content!: string;

    @Column({ type: "jsonb", nullable: true })
    mediaUrls!: string[] | null;

    @Column({ type: "jsonb", nullable: true })
    hashtags!: string[] | null;

    @Column({ type: "varchar", default: "UTC" })
    timezone!: string;

    @Column({ type: "timestamptz", nullable: true })
    scheduledAt!: Date | null;

    @Column({ type: "timestamptz", nullable: true })
    publishedAt!: Date | null;

    @Column({ type: "varchar", nullable: true })
    externalPostId!: string | null;

    @Column({ type: "text", nullable: true })
    errorMessage!: string | null;
}
