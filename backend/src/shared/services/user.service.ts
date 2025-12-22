import {UserType} from "../types/user.type";
import {AppDataSource} from "../../database/datasource";
import {UserEntity} from "../../database/entity/user-entity";
import { generateToken } from "./jwt.service";
const repository = AppDataSource.getRepository(UserEntity);
export const findUserByEmail = async (email: string):  Promise<UserType | null> => { 
    return  (await repository.findOneBy({email})) as UserType || null;
}

export const createNewUser = async (user: Partial<UserType>):Promise<string | Error>=> {

    const userExist = await findUserByEmail(user.email!);
    console.log(userExist)
    if(userExist){ 
        throw new Error("User already exist");
    }else {
        const newUser = await repository.create(user);
        await repository.save(newUser) as UserType;
        return await generateToken({...newUser})
    }
}