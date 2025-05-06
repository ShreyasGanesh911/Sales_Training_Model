import fs from "fs";
import FormData from "form-data";
import ErrorHandler from "./ErrorHandler";

const getWhisperTranscript = async (audioFilePath: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(audioFilePath));
    formData.append("model", "whisper-1");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
      body: formData as any,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);
    return data.text;

  } catch (error) {
    console.error("Error getting transcript:", error);
    throw new ErrorHandler("Failed to get transcript", 500);
  }
};

export default getWhisperTranscript;
