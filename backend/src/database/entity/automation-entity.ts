import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";

export interface AutomationNode {
    id: string;
    type: 'trigger' | 'action' | 'condition' | 'delay' | 'instagram' | 'youtube' | 'integration' | 'page_event' | 'update_element';
    position: { x: number; y: number };
    data: {
        label: string;
        eventType?: string;
        subject?: string;
        content?: string;
        duration?: string;
        unit?: string;
        conditionType?: string;
        tagName?: string;
        elementId?: string;
        property?: string;
        operator?: string;
        value?: string;
        actionType?: string;
        message?: string;
        comment?: string;
        platform?: string;
    };
}

export interface AutomationEdge {
    id: string;
    source: string;
    target: string;
}

@Entity()
export class AutomationEntity extends BaseEntity {

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "boolean", default: false })
    isActive: boolean = false;

    @Column({ type: "jsonb" })
    nodes!: AutomationNode[];

    @Column({ type: "jsonb" })
    edges!: AutomationEdge[];

    @ManyToOne(() => BioEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "bioId" })
    bio!: BioEntity;

    @Column({ type: "uuid" })
    bioId!: string;

    @OneToMany(() => AutomationExecutionEntity, (execution) => execution.automation)
    executions!: AutomationExecutionEntity[];

    executionCount?: number;
}

@Entity()
export class AutomationExecutionEntity extends BaseEntity {

    @ManyToOne(() => AutomationEntity, (automation) => automation.executions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "automationId" })
    automation!: AutomationEntity;

    @Column({ type: "uuid" })
    automationId!: string;

    @Column({ type: "varchar", default: "pending" })
    status: "pending" | "running" | "completed" | "failed" = "pending";

    @Column({ type: "jsonb", nullable: true })
    context: any = {};

    @Column({ type: "varchar", nullable: true })
    currentNodeId: string | null = null;

    @Column({ type: "text", nullable: true })
    error: string | null = null;

    @Column({ type: "timestamp", nullable: true })
    completedAt: Date | null = null;

    @Column({ type: "jsonb", nullable: true })
    triggerData: any = null;
}
