import { AppDataSource } from "../../database/datasource"
import { PostEntity } from "../../database/entity/posts-entity"
import { Post } from "../types/post.type"
import { UserEntity } from "../../database/entity/user-entity"
import { BioEntity } from "../../database/entity/bio-entity"
import { LessThanOrEqual, IsNull } from "typeorm"

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
    return await repository.save(post) as unknown as Post;
}

export const updatePost = async (id: string, postData: Partial<Post>): Promise<Post | null> => {
    await repository.update(id, postData as PostEntity);
    return await repository.findOneBy({ id }) as unknown as Post;
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
