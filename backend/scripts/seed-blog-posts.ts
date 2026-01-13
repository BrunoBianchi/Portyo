
import "reflect-metadata";
import { AppDataSource } from "../src/database/datasource";
import { PostEntity } from "../src/database/entity/posts-entity";
import { UserEntity } from "../src/database/entity/user-entity";
import { BioEntity } from "../src/database/entity/bio-entity";
import { logger } from "../src/shared/utils/logger";

const blogPosts = [
    {
        title: 'HOW TO CREATE THE PERFECT LINK IN BIO',
        content: `
            <p>Creating the perfect link in bio is essential for maximizing your social media traffic. Here are the key steps:</p>
            <h2>1. Choose the Right Platform</h2>
            <p>Select a platform that offers customization, analytics, and ease of use. Portyo is a great choice!</p>
            <h2>2. Curate Your Links</h2>
            <p>Don't overwhelm your audience. Stick to the most important links: your latest blog post, your shop, and your newsletter.</p>
            <h2>3. Design Matters</h2>
            <p>Ensure your link in bio page matches your brand's aesthetic. Use high-quality images and consistent colors.</p>
        `,
        thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
        keywords: 'social media, link in bio, tips, growth',
        status: 'published',
        views: 1250,
        createdAt: new Date('2024-01-08T10:00:00Z')
    },
    {
        title: 'BOOST YOUR SOCIAL MEDIA PRESENCE WITH ONE LINK',
        content: `
            <p>Transform your followers into customers with a powerful bio link. Learn how to optimize your profile and increase conversions with simple strategies.</p>
            <p>Your bio link is prime real estate. Make it count by directing users to high-value content.</p>
            <blockquote>"The link in bio is the bridge between your social content and your business goals."</blockquote>
        `,
        thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&q=80',
        keywords: 'social media, marketing, conversion',
        status: 'published',
        views: 980,
        createdAt: new Date('2024-01-07T14:30:00Z')
    },
    {
        title: 'TOP CREATOR MONETIZATION STRATEGIES',
        content: `
            <p>Monetizing your content doesn't have to be complicated. Here are the top strategies for creators in 2024:</p>
            <ul>
                <li><strong>Digital Products:</strong> Sell ebooks, presets, or templates directly to your audience.</li>
                <li><strong>Affiliate Marketing:</strong> Promote products you love and earn a commission.</li>
                <li><strong>Exclusive Content:</strong> Offer premium content to subscribers.</li>
            </ul>
        `,
        thumbnail: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80',
        keywords: 'monetization, creators, revenue, business',
        status: 'published',
        views: 2100,
        createdAt: new Date('2024-01-05T09:15:00Z')
    },
    {
        title: 'ANALYTICS MASTERCLASS | UNDERSTAND YOUR AUDIENCE',
        content: `
            <p>Data is power. Understanding your analytics allows you to create content that resonates with your audience.</p>
            <p>Key metrics to track:</p>
            <ol>
                <li>Click-Through Rate (CTR)</li>
                <li>Engagement Rate</li>
                <li>Audience Demographics</li>
            </ol>
            <p>Use these insights to refine your strategy and grow your following.</p>
        `,
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        keywords: 'analytics, data, insights, growth',
        status: 'published',
        views: 560,
        createdAt: new Date('2024-01-03T16:45:00Z')
    },
];

async function seed() {
    try {
        await AppDataSource.initialize();
        logger.info("Data Source initialized for seeding.");

        const userRepository = AppDataSource.getRepository(UserEntity);
        const bioRepository = AppDataSource.getRepository(BioEntity);
        const postRepository = AppDataSource.getRepository(PostEntity);

        // Find the first user
        const user = await userRepository.findOne({
            where: {},
            relations: ["bios"]
        });

        if (!user) {
            logger.error("No users found. Please create a user first.");
            process.exit(1);
        }

        // Find the first bio for this user
        let bio = user.bios && user.bios.length > 0 ? user.bios[0] : null;

        if (!bio) {
             // Try to find ANY bio if the user relations didn't load correctly or empty
             bio = await bioRepository.findOne({ where: { user: { id: user.id } } });
        }
        
        if (!bio) {
            logger.error(`No bio found for user ${user.email}. Please create a bio first.`);
            process.exit(1);
        }

        logger.info(`Seeding posts for User: ${user.email} (ID: ${user.id}) | Bio: ${bio.sufix} (ID: ${bio.id})`);

        for (const postData of blogPosts) {
            const existingPost = await postRepository.findOne({ 
                where: { 
                    title: postData.title,
                    bio: { id: bio.id }
                } 
            });

            if (existingPost) {
                logger.info(`Post "${postData.title}" already exists. Skipping.`);
                continue;
            }

            const newPost = new PostEntity();
            newPost.title = postData.title;
            newPost.content = postData.content;
            newPost.thumbnail = postData.thumbnail;
            newPost.keywords = postData.keywords;
            newPost.status = postData.status;
            newPost.views = postData.views;
            newPost.scheduledAt = postData.createdAt; // Using createdAt as scheduledAt for now or just null
            // We might want to set createdAt manually if the entity allows, but BaseEntity usually handles it.
            // Let's just let it handle createdAt automatically, but we can set scheduledAt.
            
            newPost.user = user;
            newPost.bio = bio;

            await postRepository.save(newPost);
            logger.info(`Created post: ${newPost.title}`);
        }

        logger.info("Seeding complete!");
        process.exit(0);

    } catch (error) {
        logger.error("Error during seeding:", error);
        process.exit(1);
    }
}

seed();
