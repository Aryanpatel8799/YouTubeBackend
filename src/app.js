import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectToDB from "./db/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import { Router } from "express";

const app=express();

app.use(express.json({limit:"16kb"}));
app.use(cors({
    origin:"*"
}));
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));

connectToDB();

//Routes

app.use("/api/v1/users",userRoutes);

export default app