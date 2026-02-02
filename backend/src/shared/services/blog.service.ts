import { AppDataSource } from "../../database/datasource"
import { PostEntity } from "../../database/entity/posts-entity"
import { Post } from "../types/post.type"
import { UserEntity } from "../../database/entity/user-entity"
import { BioEntity } from "../../database/entity/bio-entity"
import { LessThanOrEqual, IsNull } from "typeorm"
import { triggerAutomation } from "./automation.service"
import { logger } from "../utils/logger"

const repository = AppDataSource.getRepository(PostEntity)

export const createPost = async (postData: Partial<Post>, userId: string, bioId: string): Promise<Post> => {
    const user = await AppDataSource.getRepository(UserEntity).findOneBy({ id: userId });
    if (!user) throw new Error("User not found");

    const bio = await AppDataSource.getRepository(BioEntity).findOneBy({ id: bioId });
    if (!bio) throw new Error("Bio not found");
    
    if (bio.userId !== userId) {
        throw new Error("User does not own this bio");
    }
    
    const post = repository.create({
        ...postData,
        user,
        bio
    });
    const savedPost = await repository.save(post) as unknown as Post;

    // Trigger automation if post is published immediately
    if (savedPost.status === 'published' && (!savedPost.scheduledAt || new Date(savedPost.scheduledAt) <= new Date())) {
        try {
            logger.info(`[Blog] Triggering automation for new post ${savedPost.id}`);
            await triggerAutomation(bioId, 'blog_post_published', { 
                post: savedPost,
                postId: savedPost.id,
                postTitle: savedPost.title,
                postUrl: `https://portyo.me/${bio.sufix}/blog/${savedPost.id}`
            });
        } catch (error: any) {
            logger.error(`[Blog] Failed to trigger automation: ${error.message}`);
        }
    }

    return savedPost;
}

export const updatePost = async (id: string, postData: Partial<Post>): Promise<Post | null> => {
    await repository.update(id, postData as PostEntity);
    const updatedPost = await repository.findOne({ where: { id }, relations: ['bio'] }) as unknown as Post;

    // Trigger automation if post is published (and wasn't before, or just updated)
    // Note: This matches the simple requirement. In a real app we might want to check if it was already published to avoid duplicates.
    if (updatedPost && updatedPost.status === 'published' && (!updatedPost.scheduledAt || new Date(updatedPost.scheduledAt) <= new Date())) {
        // Simple check: if we are setting status to published in this update
        if (postData.status === 'published') {
            try {
                logger.info(`[Blog] Triggering automation for updated post ${updatedPost.id}`);
                const bioSufix = (updatedPost as any).bio?.sufix;
                await triggerAutomation((updatedPost as any).bio.id, 'blog_post_published', { 
                    post: updatedPost,
                    postId: updatedPost.id,
                    postTitle: updatedPost.title,
                    postUrl: bioSufix ? `https://portyo.me/${bioSufix}/blog/${updatedPost.id}` : ''
                });
            } catch (error: any) {
                logger.error(`[Blog] Failed to trigger automation: ${error.message}`);
            }
        }
    }

    return updatedPost;
}

export const deletePost = async (id: string): Promise<void> => {
    await repository.delete(id);
}

export const getPostById = async (id: string): Promise<Post | null> => {
    return await repository.findOne({ where: { id }, relations: ['user', 'bio'] }) as unknown as Post;
}

export const getPostsByBio = async (bioId: string, publicView: boolean = false): Promise<Post[]> => {
    if (publicView) {
        return await repository.find({ 
            where: [
                { 
                    bio: { id: bioId }, 
                    status: 'published', 
                    scheduledAt: LessThanOrEqual(new Date()) 
                },
                { 
                    bio: { id: bioId }, 
                    status: 'published', 
                    scheduledAt: IsNull() 
                }
            ],
            order: { createdAt: 'DESC' }
        }) as unknown as Post[];
    }

    return await repository.find({ 
        where: { bio: { id: bioId } },
        order: { createdAt: 'DESC' }
    }) as unknown as Post[];
}

export const getPostsByUser = async (userId: string): Promise<Post[]> => {
    return await repository.find({ where: { user: { id: userId } } }) as unknown as Post[];
}

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
    return await repository.findOne({ where: { slug }, relations: ['user', 'bio'] }) as unknown as Post;
}
