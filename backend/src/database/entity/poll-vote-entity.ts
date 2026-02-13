import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base-entity";
import { PollEntity } from "./poll-entity";

@Entity()
@Index(["pollId", "voterFingerprint"], { unique: true })
export class PollVoteEntity extends BaseEntity {
    @Column({ type: "uuid" })
    pollId!: string;

    @ManyToOne(() => PollEntity, (poll) => poll.pollVotes, { onDelete: "CASCADE" })
    @JoinColumn({ name: "pollId" })
    poll!: PollEntity;

    @Column({ type: "jsonb", default: [] })
    selectedOptionIds: string[] = [];

    @Column({ type: "varchar", nullable: true })
    voterName: string | null = null;

    @Column({ type: "varchar", nullable: true })
    voterEmail: string | null = null;

    @Column({ type: "varchar" })
    voterFingerprint!: string;

    @Column({ type: "varchar", nullable: true })
    ipAddress: string | null = null;

    @Column({ type: "varchar", nullable: true })
    userAgent: string | null = null;
}
