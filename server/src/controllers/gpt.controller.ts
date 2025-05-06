import { NextFunction, Request, Response } from "express";
import AsyncHandler from "../utils/Asynchandler";

export const handleText = AsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    res.status(200).json({
        success:true,
        message:"Audio transcript",
        data:{}
    })
})

export const handleAudio = AsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const body:Express.Multer.File = req.file as Express.Multer.File
    res.status(200).json({
        success:true,
        message:"Audio transcript",
        data:{}
    })
})

export const handleVideo= AsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    res.status(200).json({
        success:true,
        message:"Audio transcript",
        data:{}
    })
})