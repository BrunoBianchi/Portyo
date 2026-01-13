
import "reflect-metadata";
import * as dotenv from "@dotenvx/dotenvx";
import * as path from "path";
import { AppDataSource } from "../src/database/datasource";
import { PostEntity } from "../src/database/entity/posts-entity";
import { logger } from "../src/shared/utils/logger";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function listPosts() {
    try {
        await AppDataSource.initialize();
        const postRepository = AppDataSource.getRepository(PostEntity);
        
        const posts = await postRepository.find({
            relations: ["bio"],
            order: { createdAt: "DESC" },
            take: 5
        });

        console.log("\nRecent Blog Posts:");
        console.log("----------------------------------------");
        posts.forEach(post => {
            console.log(`ID: ${post.id}`);
            console.log(`Title: ${post.title}`);
            console.log(`URL: http://localhost:5173/blog/${post.id}`); // Assuming frontend port 5173
            console.log("----------------------------------------");
        });

        process.exit(0);
    } catch (error) {
        logger.error("Error listing posts:", error);
        process.exit(1);
    }
}

listPosts();
