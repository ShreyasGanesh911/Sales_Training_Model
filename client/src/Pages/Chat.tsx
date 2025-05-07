import { useRef, useState } from "react";
import Input from "../Components/Input";
import MessageBubble from "../Components/MessageBubble";
interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  type: 'text' | 'video' | 'audio'
  url?: string
}
const Chat = () => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([
      {
        text: "Demo Message",
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      }
    ]);
  return (
    <>
       <div className="flex justify-center items-start min-h-screen bg-gray-50 p-4">
       <div className="w-full 2xl:max-w-[40%] xl:max-w-[70%] relative h-[95vh] bg-white rounded-2xl shadow-lg">
        <div ref={chatContainerRef} className="h-full overflow-y-auto pb-40 px-6 pt-6">
          {messages.map((message, index) => (
            <MessageBubble  key={index} index={index}  message={message}/>
          ))}
           <div ref={messagesEndRef} />
        </div>
        <div className="absolute bottom-0.5 w-full left-0  rounded-2xl right-0 px-6 bg-white mr-5">
            <Input setMessages={setMessages}/>
        </div>
        </div>
       </div>
    </>
  )
}

export default Chat
