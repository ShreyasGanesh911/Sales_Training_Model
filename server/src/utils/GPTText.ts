import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/index"; 
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const gptText = async (text:string,message:ChatCompletionMessageParam[])=>{
   try {
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [...message,{role:"user",content:text}]
    });
    return response.choices[0].message.content;
   } catch (error) {
    
    console.log(error)
    return null
   }
};

export default gptText;