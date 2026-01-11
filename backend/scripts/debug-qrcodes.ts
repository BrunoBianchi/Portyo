
import { AppDataSource } from "../src/database/datasource";
import { QRCodeEntity } from "../src/database/entity/qrcode-entity";

async function main() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected");

        const repository = AppDataSource.getRepository(QRCodeEntity);
        const allQrs = await repository.find({
            select: ['id', 'value', 'views']
        });

        console.log(`Found ${allQrs.length} QR codes:`);
        allQrs.forEach(qr => {
            console.log(`- ID: ${qr.id} | Value: ${qr.value} | Views: ${qr.views}`);
        });
        
        const targetId = "16f5f99a-13c3-4a93-a417-9845f6c5a2af";
        const target = allQrs.find(q => q.id === targetId);
        if (target) {
            console.log(`\nTARGET ID FOUND: ${targetId}`);
        } else {
            console.log(`\nTARGET ID NOT FOUND: ${targetId}`);
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

main();
