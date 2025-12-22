import express from "express";
import * as dotenv from "dotenv";
import apiController from "./controllers/api.controller";

dotenv.config();

const app = express();
app.use(express.json());
app.use(apiController);
export const InitializateServer = () => {
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
})
}

