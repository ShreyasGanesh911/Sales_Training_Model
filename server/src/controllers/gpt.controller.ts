import { NextFunction, Request, Response } from "express";
import AsyncHandler from "../utils/Asynchandler";
import ErrorHandler from "../utils/ErrorHandler";
import getWhisperTranscript from "../utils/WhisperTranscript";
import uploadToCloudinary from "../utils/UploadToCloudinary";

export const handleText = AsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    res.status(200).json({
        success:true,
        message:"Audio transcript",
        data:{}
    })
})

export const handleAudio = AsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const file = req.file as Express.Multer.File;
    // console.log(file)
    if(!file){
        return next(new ErrorHandler("No audio file provided",400));
    }
    try {
        const transcript = await getWhisperTranscript(file.path);
        const audioUrl = await uploadToCloudinary(file.path);
        res.status(200).json({
            success: true,
            message: "Audio transcribed successfully",
            data: {
                transcript,
                url:audioUrl?.url
            }
        });
    } catch (error) {
        return next(new ErrorHandler("Failed to transcribe audio" + error,500))
    }
})

export const handleVideo= AsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const file = req.file as Express.Multer.File;
    // console.log(file)
    if(!file){
        return next(new ErrorHandler("No video file provided",400));
    }
    const transcript = await getWhisperTranscript(file.path);
    const videoUrl = await uploadToCloudinary(file.path);
    const videoUrlString = videoUrl?.url;

    // console.log(videoUrl)
    res.status(200).json({
        success:true,
        message:"Audio transcript",
        data:{
            transcript,
            url:videoUrlString
        }
    })
})