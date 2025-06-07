import http from "http";
import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();

const server=http.createServer(app);

server.listen(process.env.PORT||5000,()=>
    console.log("server is running on port "+process.env.PORT
));

