import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import ErrorHandler from "./ErrorHandler";
type ResponseObject = {
  data: {
    text: string;
  };
};
const getWhisperTranscript = async (audioFilePath: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(audioFilePath));
    formData.append("model", "whisper-1");
    formData.append("language", "en");
    const respose:ResponseObject = await axios.post("https://api.openai.com/v1/audio/transcriptions",formData,{
      headers:{
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
    })
    const transcript = respose.data.text
    // console.log(transcript)
    if(transcript.length<1){
      console.log("No text detected in the audio")
      throw new ErrorHandler("No text detected in the audio", 400);
    }
    return transcript

  } catch (error) {
    console.error("Error getting transcript:", error);
    throw new ErrorHandler("Failed to get transcript: No audio detected", 500);
  }
};

export default getWhisperTranscript;
