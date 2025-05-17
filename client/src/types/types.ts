import type { Dispatch, SetStateAction } from "react";

export interface Message {
    text: string;
    isUser: boolean;
    timestamp: Date;
    type: 'text' | 'video' | 'audio'
    url?: string
}

// response from the server when a video is uploaded
export type UploadVideoResponse = {
    success: boolean
    message: string
    data: {
      transcript: string
      url: string
      gptResponse: string
    }
}

// response from the server when a audio is uploaded
export type AudioResponse = {
    success: boolean;
    message: string;
    data: {
      transcript: string;
      url: string;
      gptResponse: string;
    }
} 
// Props passed to video, audio, input components
export type SetMessageProps = {
    setMessages: Dispatch<SetStateAction<Message[]>>
}
  //  Chat component messages for GPT
export interface GPTMessage {
    role: "system" | "user" | "assistant";
    content: string;
}