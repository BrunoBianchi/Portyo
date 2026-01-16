
import { AppDataSource } from "./database/datasource";
import { MarketingProposalEntity } from "./database/entity/marketing-proposal-entity";
import * as fs from 'fs';

async function main() {
    try {
        await AppDataSource.initialize();
        const repo = AppDataSource.getRepository(MarketingProposalEntity);
        const proposal = await repo.findOne({ 
            where: {}, 
            order: { createdAt: 'DESC' }
        });
        
        if (proposal) {
            fs.writeFileSync('proposal_uuid.txt', proposal.id);
            console.log("Wrote UUID to proposal_uuid.txt");
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
main();
