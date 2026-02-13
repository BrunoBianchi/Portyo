import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";

export interface AutomationNode {
    id: string;
    type: 'trigger' | 'action' | 'condition' | 'delay' | 'instagram' | 'youtube' | 'integration' | 'page_event' | 'update_element' | 'math_operation' | 'wait' | 'webhook' | 'discord' | 'stripe_discount';
    position: { x: number; y: number };
    data: {
        label: string;
        eventType?: 'email_signup' | 'newsletter_subscribe' | 'subscriber_unsubscribe' | 'form_submit' | 'booking_created' | 'qr_scanned' | 'visit_milestone' | 'view_milestone' | 'click_milestone' | 'form_submit_milestone' | 'lead_milestone' | 'bio_visit' | 'link_click' | 'blog_post_published' | 'custom_event' | 'webhook_received';
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
        commentId?: string;
        recipientId?: string;
        imageUrl?: string;
        platform?: string;
        sendToAllLeads?: boolean;
        leadCount?: number;
        // Math Operation Fields
        mathOperator?: '+' | '-' | '*' | '/';
        operand1?: string;
        operand2?: string;
        resultVarName?: string;
        // Condition Fields
        conditionKey?: string;
        conditionOperator?: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
        conditionValue?: string | number;
        // Wait Fields
        waitDuration?: number;
        waitUnit?: 'minutes' | 'hours' | 'days';
        // Webhook / Discord Fields
        webhookUrl?: string;
        webhookMethod?: 'POST' | 'GET';
        webhookHeaders?: Record<string, string>;
        webhookBody?: string; // Liquid/Template support
        discordWebhookUrl?: string;
        discordMessage?: string;
        // Milestone Fields
        milestoneCount?: number;
        // Stripe Discount Fields
        discountType?: 'percent' | 'amount';
        percentOff?: number;
        amountOff?: number;
        currency?: string;
        durationType?: 'once' | 'repeating' | 'forever';
        durationInMonths?: number;
        maxRedemptions?: number;
        promotionCodePrefix?: string;
        expiresInValue?: number;
        expiresInUnit?: 'minutes' | 'hours' | 'days';
    };
}

export interface AutomationEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
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
