import { NextFunction, Request, Response } from "express";
import AsyncHandler from "../utils/Asynchandler";
import ErrorHandler from "../utils/ErrorHandler";
import getWhisperTranscript from "../utils/WhisperTranscript";
import uploadToCloudinary from "../utils/UploadToCloudinary";
import gptText from "../utils/GPTText";
import { sales_script } from "../script/script";
import * as fs from 'fs';

enum Role {
    USER = "user",
    ASSISTANT = "assistant",
    SYSTEM = "system"
}
export const handleText = AsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {text,messages} = req.body;
   
    const response = await gptText(text,messages,Role.USER);
    if(!response){
        next(new ErrorHandler("Failed to generate a response from GPT",500))
        return 
    }
    res.status(200).json({
        success:true,
        message:"Audio transcript",
        data:response
    })
})

export const handleAudio = AsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const file = req.file as Express.Multer.File;
    const messages = JSON.parse(req.body.messages);
    
    if(!file){
        return next(new ErrorHandler("No audio file provided",400));
    }

    try {
        // Run transcript generation and audio upload in parallel for better performance
        const [transcriptResult, audioUploadResult] = await Promise.all([
            getWhisperTranscript(file.path),
            uploadToCloudinary(file.path)
        ]);

        const transcript = transcriptResult;
        const audioUrlString = audioUploadResult?.url;

        // Get GPT response after we have the transcript
        const gptResponse = await gptText(transcript, messages, Role.USER);

        // Delete the file after processing
        fs.unlinkSync(file.path);

        if (!gptResponse) {
            return next(new ErrorHandler("Failed to generate GPT response", 500));
        }
        
        res.status(200).json({
            success: true,
            message: "Audio processed successfully",
            data: {
                transcript,
                url: audioUrlString,
                gptResponse
            }
        });
    } catch (error) {
        // Cleanup the file in case of error
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        console.error("Error processing audio:", error);
        return next(new ErrorHandler(`Failed to process audio: ${error}`, 500));
    }
})

export const handleVideo= AsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const file = req.file as Express.Multer.File;
    const smileDetected:boolean = req.body.smileDetected?.toLowerCase() === 'true';
    const messages = JSON.parse(req.body.messages);
    if(!file){
        return next(new ErrorHandler("No video file provided",400));
    }

    // Run transcript generation and video upload in parallel
    const [transcriptResult, videoUploadResult] = await Promise.all([
        getWhisperTranscript(file.path),
        uploadToCloudinary(file.path)
    ]);

    let transcript = transcriptResult;
    const speechNote = transcript;
    transcript += smileDetected
        ? '\n[Note: The person smiled while speaking]'
        : '\n[Note: The person did not smile while speaking]';

    const gptResponse = await gptText(transcript, messages, Role.USER);
    const videoUrlString = videoUploadResult?.url;

    // Delete the file after processing
    fs.unlinkSync(file.path);

    res.status(200).json({
        success:true,
        message:"Video transcript",
        data:{
            transcript:speechNote,
            url:videoUrlString,
            gptResponse
        }
    }) 
})

export const handleAssessmentStart = AsyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const text = sales_script;
    const response = await gptText(text,[],Role.SYSTEM);
    res.status(200).json({
        success:true,
        message:"Assessment started",
        data:response
    })
})
