import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectToDB from "./db/db.js";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import { Router } from "express";
import cookieParser from "cookie-parser";
import videoRouter from "./routes/video.routes.js"
import subscriberRoutes from "./routes/subscription.routes.js";
import likeRoutes from "./routes/like.routes.js";
import commentRoutes from "./routes/comment.routes.js";


const app=express();

app.use(express.json({limit:"16kb"}));
app.use(cors({
    origin:"*"
}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())

connectToDB();

//Routes

app.use("/api/v1/users",userRoutes);
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/subscribers",subscriberRoutes)
app.use("/api/v1/likes",likeRoutes)
app.use("/api/v1/comments",commentRoutes)


export default app