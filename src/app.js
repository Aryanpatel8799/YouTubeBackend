import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectToDB from "./db/db.js";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import { Router } from "express";
import cookieParser from "cookie-parser";

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

export default app