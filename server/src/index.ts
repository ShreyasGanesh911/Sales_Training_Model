import app from "./app.js";
import "dotenv/config"
import { Request,Response } from "express";
import path from "path"
import express from "express";
const port = process.env.PORT || 8888

// Serve static files from the React dist directory
app.use(express.static(path.join(__dirname, "../../client/dist")));

// Handle all other routes by serving index.html
app.get("*",(req:Request,res:Response)=>{
    res.sendFile(path.join(__dirname, "../../client/dist/index.html"))
})

app.listen(port,()=>{
    console.log("Active at port",port)
})