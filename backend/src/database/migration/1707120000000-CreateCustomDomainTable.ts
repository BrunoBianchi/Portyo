import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateCustomDomainTable1707120000000 implements MigrationInterface {
    name = 'CreateCustomDomainTable1707120000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "custom_domain_entity",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "domain",
                        type: "varchar",
                        isUnique: true,
                    },
                    {
                        name: "bioId",
                        type: "uuid",
                    },
                    {
                        name: "userId",
                        type: "uuid",
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["pending", "verifying_dns", "dns_verified", "generating_ssl", "active", "failed", "expired", "suspended"],
                        default: "'pending'",
                    },
                    {
                        name: "errorMessage",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "expectedDnsValue",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "dnsVerifiedAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "actualDnsValue",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "sslActive",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "sslExpiresAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "sslCertificatePath",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "sslPrivateKeyPath",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "lastCheckedAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "activatedAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "retryCount",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "lastErrorAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "redirectWww",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "forceHttps",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "redirectTo",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "verificationToken",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "lastHealthCheckAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "isHealthy",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );

        // Criar índices
        await queryRunner.createIndex(
            "custom_domain_entity",
            new TableIndex({
                name: "IDX_CUSTOM_DOMAIN_DOMAIN",
                columnNames: ["domain"],
            })
        );

        await queryRunner.createIndex(
            "custom_domain_entity",
            new TableIndex({
                name: "IDX_CUSTOM_DOMAIN_BIO",
                columnNames: ["bioId"],
            })
        );

        await queryRunner.createIndex(
            "custom_domain_entity",
            new TableIndex({
                name: "IDX_CUSTOM_DOMAIN_USER",
                columnNames: ["userId"],
            })
        );

        await queryRunner.createIndex(
            "custom_domain_entity",
            new TableIndex({
                name: "IDX_CUSTOM_DOMAIN_STATUS",
                columnNames: ["status"],
            })
        );

        // Criar chaves estrangeiras
        await queryRunner.query(`
            ALTER TABLE "custom_domain_entity" 
            ADD CONSTRAINT "FK_CUSTOM_DOMAIN_BIO" 
            FOREIGN KEY ("bioId") REFERENCES "bio_entity"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "custom_domain_entity" 
            ADD CONSTRAINT "FK_CUSTOM_DOMAIN_USER" 
            FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("custom_domain_entity");
    }
}
