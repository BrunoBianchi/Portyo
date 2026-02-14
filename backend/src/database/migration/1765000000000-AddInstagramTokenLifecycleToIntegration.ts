import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm";

export class AddInstagramTokenLifecycleToIntegration1765000000000 implements MigrationInterface {
    name = "AddInstagramTokenLifecycleToIntegration1765000000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns("integration_entity", [
            new TableColumn({
                name: "accessTokenExpiresAt",
                type: "timestamp",
                isNullable: true,
            }),
            new TableColumn({
                name: "tokenLastRefreshedAt",
                type: "timestamp",
                isNullable: true,
            }),
            new TableColumn({
                name: "tokenLastRefreshAttemptAt",
                type: "timestamp",
                isNullable: true,
            }),
            new TableColumn({
                name: "tokenLastRefreshError",
                type: "text",
                isNullable: true,
            }),
            new TableColumn({
                name: "tokenRefreshLockUntil",
                type: "timestamp",
                isNullable: true,
            }),
        ]);

        await queryRunner.createIndex(
            "integration_entity",
            new TableIndex({
                name: "IDX_INTEGRATION_PROVIDER_EXPIRES_AT",
                columnNames: ["provider", "accessTokenExpiresAt"],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex("integration_entity", "IDX_INTEGRATION_PROVIDER_EXPIRES_AT");

        await queryRunner.dropColumns("integration_entity", [
            "tokenRefreshLockUntil",
            "tokenLastRefreshError",
            "tokenLastRefreshAttemptAt",
            "tokenLastRefreshedAt",
            "accessTokenExpiresAt",
        ]);
    }
}
