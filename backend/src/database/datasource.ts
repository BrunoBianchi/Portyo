import { DataSource } from "typeorm"
import { UserEntity } from "./entity/user-entity"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "",
    entities: [UserEntity],
    synchronize: true,
    logging: false,
})

