import { DataSource } from "typeorm"
import { UserEntity } from "./entity/user-entity"
import { BioEntity } from "./entity/bio-entity"
import { PostEntity } from "./entity/posts-entity"
import { QRCodeEntity } from "./entity/qrcode-entity"
import { EmailEntity } from "./entity/email-entity"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "portyo",
    entities: [UserEntity,BioEntity,PostEntity,QRCodeEntity,EmailEntity],
    synchronize: true,
    logging: false,
})

