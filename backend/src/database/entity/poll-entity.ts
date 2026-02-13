import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";
import { PollVoteEntity } from "./poll-vote-entity";

@Entity()
export class PollEntity extends BaseEntity {
    @Column({ type: "varchar" })
    title!: string;

    @Column({ type: "text", nullable: true })
    description: string | null = null;

    @Column({ type: "jsonb", default: [] })
    options: Array<{ id: string; label: string }> = [];

    @Column({ type: "boolean", default: true })
    isActive: boolean = true;

    @Column({ type: "boolean", default: false })
    allowMultipleChoices: boolean = false;

    @Column({ type: "boolean", default: false })
    requireName: boolean = false;

    @Column({ type: "boolean", default: false })
    requireEmail: boolean = false;

    @Column({ type: "boolean", default: true })
    showResultsPublic: boolean = true;

    @Column({ type: "varchar", default: "bar" })
    chartType: "bar" | "pie" | "donut" = "bar";

    @Column({ type: "jsonb", default: ["#111827", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#4b5563"] })
    chartColors: string[] = ["#111827", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#4b5563"];

    @Column({ type: "timestamp", nullable: true })
    startsAt: Date | null = null;

    @Column({ type: "timestamp", nullable: true })
    endsAt: Date | null = null;

    @Column({ type: "int", default: 0 })
    votes: number = 0;

    @Column({ type: "uuid" })
    bioId!: string;

    @ManyToOne(() => BioEntity, (bio) => bio.polls)
    @JoinColumn({ name: "bioId" })
    bio!: BioEntity;

    @OneToMany(() => PollVoteEntity, (vote) => vote.poll)
    pollVotes!: PollVoteEntity[];
}
