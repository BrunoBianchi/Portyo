import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSponsoredClickFraudPrevention1739300000000 implements MigrationInterface {
    name = 'AddSponsoredClickFraudPrevention1739300000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add invalidReason column
        await queryRunner.query(`
            ALTER TABLE "sponsored_clicks" 
            ADD COLUMN IF NOT EXISTS "invalidReason" varchar NULL
        `);

        // Add index for session-based dedup  
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_SPONSORED_CLICK_SESSION_CREATED" 
            ON "sponsored_clicks" ("sessionId", "createdAt")
        `);

        // Add index for daily IP cap
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_SPONSORED_CLICK_VALID_CREATED"
            ON "sponsored_clicks" ("ipHash", "isValid", "createdAt")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_SPONSORED_CLICK_VALID_CREATED"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_SPONSORED_CLICK_SESSION_CREATED"`);
        await queryRunner.query(`ALTER TABLE "sponsored_clicks" DROP COLUMN IF EXISTS "invalidReason"`);
    }
}
