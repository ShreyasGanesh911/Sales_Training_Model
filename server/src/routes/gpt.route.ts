import express from "express";
import { handleAudio,handleVideo,handleText } from "../controllers/gpt.controller.js";
import upload from "../middlewares/Multer.js";

const gptRoute = express.Router();
/*
    Need to have 3 routes 
    1. when user sends a text --> send it directly to chatgpt api and get the response
    2. When user sends an audio file --> send it to whisper api and get the transcript and then send it to chatgpt api and get the response
    3. When user sends a video file --> send it to whisper api and get the transcript and then send it to chatgpt api and get the response
*/
gptRoute.post("/text", handleText);
gptRoute.post("/audio", upload.single("audio"),handleAudio);
gptRoute.post("/video",upload.single("video") ,handleVideo);

export default gptRoute;