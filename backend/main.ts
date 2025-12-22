import "reflect-metadata";
import { InitializateServer } from "./src/server";
import { AppDataSource } from "./src/database/datasource";

AppDataSource.initialize().then(() => {
    console.log("Data Source has been initialized!");
    InitializateServer();
}).catch((error) => console.error("Error during Data Source initialization", error))
