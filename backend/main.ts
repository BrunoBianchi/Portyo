import "reflect-metadata";
import { InitializateServer } from "./src/server";
import { AppDataSource } from "./src/database/datasource";
import { logger } from "./src/shared/utils/logger";

AppDataSource.initialize().then(() => {
    logger.info("Data Source has been initialized!");
    InitializateServer();
}).catch((error) => logger.error("Error during Data Source initialization", error))
