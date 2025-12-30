import { AppDataSource } from "../../database/datasource"
import { BioEntity } from "../../database/entity/bio-entity"
import { IntegrationEntity } from "../../database/entity/integration-entity"
const repository = AppDataSource.getRepository(IntegrationEntity)
import { findBioById, findBioBySufix } from "./bio.service"
export const createIntegration = async(name:string,account_id:string,bio:string) => {
    const bioObject = await findBioById(bio)
    const newIntegration = await  repository.create({name,account_id})
    newIntegration.bio = bioObject as BioEntity;
    return await repository.save(newIntegration)
}

export const getIntegrationByNameAndBioId = async(name:string,bio:string) => {
    const integration = await  repository.findOne({
        where:{
            name,
            bio:{
                id:bio
            }
        }
    })
    return integration
}

export const updatedIntegration = async(id:string,name:string,account_id:string,bio:string) => {
    const bioObject = await findBioBySufix(bio)
    let integration = await getIntegrationByNameAndBioId(name,bio)
    integration!.name = name;
    integration!.account_id = account_id;
    return await repository.save(integration!)
}

export const getIntegrationsByBioId = async(bioId:string) => {
    return await repository.find({
        where:{
            bio:{
                id:bioId
            }
        }
    })
}