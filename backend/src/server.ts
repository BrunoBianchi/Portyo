import express from "express";
import * as dotenv from "dotenv";
import apiController from "./controllers/api.controller";
import { decryptToken } from "./shared/services/jwt.service";
import * as session from "express-session"
import { UserType } from "./shared/types/user.type";
import { errorMiddleware } from "./middlewares/error.middleware";
import cors from "cors"
dotenv.config();

const app = express();
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        // Allow localhost:5173 and any subdomain of localhost:5173
        if (origin === "http://localhost:5173" || /^http:\/\/.*\.localhost:5173$/.test(origin)) {
            callback(null, true);
        } 
        // Allow requests from the backend itself (for testing/preview if served from same origin)
        else if (origin === "http://localhost:3000") {
            callback(null, true);
        }
        // Allow null origin (for local file testing or some redirects)
        else if (origin === "null") {
            callback(null, true);
        }
        else {
            // For development, let's be more permissive if needed, or log the blocked origin
            console.log("Blocked CORS origin:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json());
app.use(session.default({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(async (req, res, next) => {
    const { authorization } = req.headers
    const token = authorization?.split("Bearer ")[1]?.trim();
    if (token) {
        const user = await decryptToken(token) as UserType
        const payload = {
            fullname: user.fullName,
            email: user.email,
            id: user.id,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
        if (user) {
            (req.session as any).user = payload
        }
    }
    next()
})



app.use(apiController);
app.use(errorMiddleware);
export const InitializateServer = () => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    })
}

