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
    const respose:ResponseObject = await axios.post("https://api.openai.com/v1/audio/transcriptions",formData,{
      headers:{
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    const transcript = respose.data.text
    console.log(transcript)
    return transcript

  } catch (error) {
    console.error("Error getting transcript:", error);
    throw new ErrorHandler("Failed to get transcript" + error, 500);
  }
};

export default getWhisperTranscript;
