import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/index"; 
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
 enum Role {
    USER = "user",
    ASSISTANT = "assistant",
    SYSTEM = "system"
}
const gptText = async (text:string,message:ChatCompletionMessageParam[],role:Role)=>{
   try {
    
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [...message,{role:role,content:text}]
    });
    const len = [...message,{role:role,content:text}].length
    console.log(len)
    console.log([...message,{role:role,content:text}][len-1].content)
    return response.choices[0].message.content;
   } catch (error) {
    
    console.log(error)
    return null
   }
};

export default gptText;