
import "reflect-metadata";
import * as dotenv from "@dotenvx/dotenvx";
import * as path from "path";
import * as fs from "fs";
import { AppDataSource } from "../src/database/datasource";
import { PostEntity } from "../src/database/entity/posts-entity";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function listPosts() {
    try {
        await AppDataSource.initialize();
        const postRepository = AppDataSource.getRepository(PostEntity);
        
        const posts = await postRepository.find({
            order: { createdAt: "DESC" },
            take: 5
        });

        const output = posts.map(post => ({
            id: post.id,
            title: post.title,
            url: `http://localhost:5173/blog/${post.id}`
        }));

        fs.writeFileSync(path.resolve(__dirname, "../posts.json"), JSON.stringify(output, null, 2));
        console.log("Written to posts.json");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

listPosts();
