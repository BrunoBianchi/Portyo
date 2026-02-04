import { Column, Entity, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "./base-entity";
import { BioEntity } from "./bio-entity";
import { UserEntity } from "./user-entity";

export enum CustomDomainStatus {
    PENDING = "pending",
    VERIFYING_DNS = "verifying_dns",
    DNS_VERIFIED = "dns_verified",
    GENERATING_SSL = "generating_ssl",
    ACTIVE = "active",
    FAILED = "failed",
    EXPIRED = "expired",
    SUSPENDED = "suspended"
}

@Entity()
@Index(["domain"], { unique: true })
@Index(["bioId"])
@Index(["userId"])
@Index(["status"])
export class CustomDomainEntity extends BaseEntity {
    @Column({ type: "varchar", unique: true })
    domain!: string; // ex: parivahansewa.com

    @Column({ type: "uuid" })
    bioId!: string;

    @ManyToOne(() => BioEntity, (bio) => bio.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "bioId" })
    bio!: BioEntity;

    @Column({ type: "uuid" })
    userId!: string;

    @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: UserEntity;

    @Column({
        type: "enum",
        enum: CustomDomainStatus,
        default: CustomDomainStatus.PENDING
    })
    status!: CustomDomainStatus;

    @Column({ type: "varchar", nullable: true })
    errorMessage?: string; // Mensagem de erro se falhar

    // DNS Verification
    @Column({ type: "varchar", nullable: true })
    expectedDnsValue?: string; // Valor esperado do registro DNS

    @Column({ type: "timestamp", nullable: true })
    dnsVerifiedAt?: Date;

    @Column({ type: "varchar", nullable: true })
    actualDnsValue?: string; // Valor atual do DNS (para debug)

    // SSL Certificate
    @Column({ type: "boolean", default: false })
    sslActive!: boolean;

    @Column({ type: "timestamp", nullable: true })
    sslExpiresAt?: Date;

    @Column({ type: "varchar", nullable: true })
    sslCertificatePath?: string;

    @Column({ type: "varchar", nullable: true })
    sslPrivateKeyPath?: string;

    // Timestamps de processo
    @Column({ type: "timestamp", nullable: true })
    lastCheckedAt?: Date;

    @Column({ type: "timestamp", nullable: true })
    activatedAt?: Date;

    @Column({ type: "int", default: 0 })
    retryCount!: number;

    @Column({ type: "timestamp", nullable: true })
    lastErrorAt?: Date;

    // Configurações adicionais
    @Column({ type: "boolean", default: true })
    redirectWww!: boolean; // Redirecionar www para non-www

    @Column({ type: "boolean", default: false })
    forceHttps!: boolean; // Forçar HTTPS (sempre true quando sslActive)

    @Column({ type: "varchar", nullable: true })
    redirectTo?: string; // Se quiser redirecionar para outro domínio

    // Metadados
    @Column({ type: "varchar", nullable: true })
    verificationToken?: string; // Token para verificação de propriedade

    @Column({ type: "timestamp", nullable: true })
    lastHealthCheckAt?: Date;

    @Column({ type: "boolean", default: true })
    isHealthy!: boolean;
}
