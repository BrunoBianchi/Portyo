import { Column, Entity, ManyToOne, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./base-entity";
import { UserEntity } from "./user-entity";
import { BioEntity } from "./bio-entity";
import { MarketingProposalEntity } from "./marketing-proposal-entity";

@Entity('marketing_slots')
export class MarketingSlotEntity extends BaseEntity {

    @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: UserEntity;

    @Column({ type: "uuid" })
    userId!: string;

    @ManyToOne(() => BioEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "bioId" })
    bio!: BioEntity;

    @Column({ type: "uuid" })
    bioId!: string;

    // Configuração do Slot
    @Column({ type: "varchar", length: 100 })
    slotName!: string; // "Banner Principal", "Sidebar Ad", etc

    @Column({ type: "decimal", precision: 10, scale: 2 })
    priceMin!: number; // Preço mínimo

    @Column({ type: "decimal", precision: 10, scale: 2 })
    priceMax!: number; // Preço máximo

    @Column({ type: "integer" })
    duration!: number; // Duração em dias

    @Column({ type: "boolean", default: false })
    acceptOtherPrices!: boolean; // Aceita propostas fora da faixa

    // Status do slot
    @Column({ 
        type: "varchar", 
        length: 20,
        default: 'available'
    })
    status!: 'available' | 'occupied' | 'pending_approval';

    // Métricas históricas do slot (para empresas verem)
    @Column({ type: "numeric", default: 0 })
    avgImpressions!: number;

    @Column({ type: "numeric", default: 0 })
    avgClicks!: number;

    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    avgCTR!: number; // Click-through rate médio

    // Proposta ativa (quando occupied)
    @Column({ type: "uuid", nullable: true })
    activeProposalId?: string | null;

    @OneToOne(() => MarketingProposalEntity)
    @JoinColumn({ name: "activeProposalId" })
    activeProposal?: MarketingProposalEntity;

    @Column({ type: "timestamp", nullable: true })
    activeSince?: Date | null;

    @Column({ type: "timestamp", nullable: true })
    expiresAt?: Date | null;

    // Estatísticas totais
    @Column({ type: "numeric", default: 0 })
    totalRevenue!: number; // Revenue total gerado

    @Column({ type: "numeric", default: 0 })
    totalProposals!: number; // Total de propostas recebidas

    @Column({ type: "numeric", default: 0 })
    position!: number; // Ordem de exibição
}
