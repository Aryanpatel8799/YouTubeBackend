import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectToDB from "./db/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express();

app.use(express.json({limit:"16kb"}));
app.use(cors({
    origin:"*"
}));
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));

connectToDB();


export default app