import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { UserEntity } from "./user-entity";
import { MarketingSlotEntity } from "./marketing-slot-entity";

@Entity('marketing_proposals')
export class MarketingProposalEntity extends BaseEntity {

    @ManyToOne(() => MarketingSlotEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "slotId" })
    slot!: MarketingSlotEntity;

    @Column({ type: "uuid" })
    slotId!: string;

    // Empresa que faz a proposta (opcional se for guest)
    @ManyToOne(() => UserEntity, { onDelete: "CASCADE", nullable: true })
    @JoinColumn({ name: "companyId" })
    company?: UserEntity;

    @Column({ type: "uuid", nullable: true })
    companyId?: string;

    // Campos para Guest (se não logado)
    @Column({ type: "varchar", nullable: true })
    guestName?: string;

    @Column({ type: "varchar", nullable: true })
    guestEmail?: string;

    // Dados da Proposta
    @Column({ type: "decimal", precision: 10, scale: 2 })
    proposedPrice!: number;

    @Column({ type: "text", nullable: true })
    message?: string; // Mensagem da empresa para o usuário

    // Conteúdo do Card Customizado criado pela empresa
    @Column({ type: "jsonb" })
    content!: {
        title: string;
        description: string;
        imageUrl?: string;
        linkUrl: string;
        buttonText?: string;
        backgroundColor?: string;
        textColor?: string;
        buttonColor?: string;
        buttonTextColor?: string;
        layout?: 'card' | 'banner' | 'compact' | 'featured';
        sponsorLabel?: string;
    };

    // Status da proposta
    @Column({ 
        type: "varchar", 
        length: 20,
        default: 'pending'
    })
    status!: 'pending' | 'accepted' | 'rejected' | 'expired' | 'active';

    // Métricas (quando ativo)
    @Column({ type: "numeric", default: 0 })
    impressions!: number;

    @Column({ type: "numeric", default: 0 })
    clicks!: number;

    // Resposta do usuário
    @Column({ type: "timestamp", nullable: true })
    respondedAt?: Date | null;

    @Column({ type: "text", nullable: true })
    rejectionReason?: string | null;

    // Payment link
    @Column({ type: "text", nullable: true })
    paymentLink?: string | null;

    @Column({ type: "timestamp", nullable: true })
    paymentLinkExpiry?: Date | null;
}
