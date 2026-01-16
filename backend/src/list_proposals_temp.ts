
import { AppDataSource } from "./database/datasource";
import { MarketingProposalEntity } from "./database/entity/marketing-proposal-entity";

async function main() {
    try {
        await AppDataSource.initialize();
        const repo = AppDataSource.getRepository(MarketingProposalEntity);
        const proposals = await repo.find({ take: 5, relations: ['slot'] });
        console.log("PROPOSALS_FOUND:", JSON.stringify(proposals, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
main();
