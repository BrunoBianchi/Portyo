
import { AppDataSource } from "./database/datasource";
import { MarketingProposalEntity } from "./database/entity/marketing-proposal-entity";
import { UserEntity } from "./database/entity/user-entity";

async function main() {
    try {
        await AppDataSource.initialize();
        const repo = AppDataSource.getRepository(MarketingProposalEntity);
        // Find any proposal, preferably one that is recently created
        const proposal = await repo.findOne({ 
            where: {}, 
            order: { createdAt: 'DESC' },
            relations: ['slot'] 
        });
        
        if (proposal) {
            console.log("PROPOSAL_ID:", proposal.id);
            console.log("SLOT_NAME:", proposal.slot.slotName);
        } else {
            console.log("NO_PROPOSALS_FOUND");
        }
    } catch (err) {
        console.error("ERROR:", err);
    } finally {
        process.exit(0);
    }
}
main();
