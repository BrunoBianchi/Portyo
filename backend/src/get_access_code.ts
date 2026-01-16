
import { AppDataSource } from "./database/datasource";
import { MarketingProposalEntity } from "./database/entity/marketing-proposal-entity";
import * as fs from 'fs';

async function main() {
    try {
        await AppDataSource.initialize();
        const repo = AppDataSource.getRepository(MarketingProposalEntity);
        // We know the proposal ID is correct because we just used it
        const proposalId = fs.readFileSync('proposal_uuid.txt', 'utf8').trim();
        
        const proposal = await repo.findOne({ 
            where: { id: proposalId }
        });
        
        if (proposal) {
            console.log("ACCESS_CODE:", proposal.accessCode);
            fs.writeFileSync('access_code.txt', proposal.accessCode || "NULL");
        } else {
            console.log("PROPOSAL_NOT_FOUND");
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
main();
