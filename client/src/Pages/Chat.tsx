import { useEffect, useRef, useState } from "react";
import Input from "../Components/Input";
import MessageBubble from "../Components/MessageBubble";
import useLocalStorage from "../hooks/useLocalStorage";
import { sales_script } from "../assets/script";
import { ToastContainer } from "react-toastify";
const URL = import.meta.env.VITE_SERVER_URL || ""
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}
interface MessageBubble {
  text: string;
  isUser: boolean;
  timestamp: Date;
  type: 'text' | 'video' | 'audio'
  url?: string
}
const welcomeMessage = `Welcome! 👋 \n\nTo get started, press the <span class="text-blue-500 hover:text-blue-600 hover:cursor-pointer">Start Assessment</span> button.`

const Chat = () => {
  const {clearMessages } = useLocalStorage('chatMessages');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isAssessment, setIsAssessment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonText, setButtonText] = useState("Start Assessment");
  const [chatMessages, setChatMessages] = useState<MessageBubble[]>([
    {
      isUser:false,
      text:welcomeMessage,
      timestamp:new Date(),
      type:'text',
      
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    clearMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleStartAssessment = async(e:React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setButtonText("Starting assessment...");
    const msg1:Message = {
      content:sales_script,
      role:'system'
    }
    const response = await fetch(`${URL}/api/v1/gpt/assessment`,{
      method:"POST",
    });
    const data = await response.json();
    const msg2:Message = {
      content:data.data,
      role:'assistant'
    }
    localStorage.setItem('chatMessages',JSON.stringify([msg1,msg2]))
    setChatMessages([{
      isUser:false,
      text:data.data,
      timestamp:new Date(),
      type:'text',
    }])
    setIsAssessment(true);
    setIsLoading(false);
  }

  return (
    <>
       <div className="flex justify-center items-start min-h-screen bg-gray-50 p-4">
       <div className="w-full 2xl:max-w-[40%] xl:max-w-[70%] relative h-[95vh] bg-white rounded-2xl shadow-lg">
        <div ref={chatContainerRef} className="h-full overflow-y-auto pb-40 px-6 pt-6">
          {chatMessages.map((message, index) => (
            <MessageBubble  key={index} index={index}  message={message}/>
          ))}
           <div ref={messagesEndRef} />
        </div>
        <div className="absolute bottom-0.5 w-full left-0  rounded-2xl right-0 px-6 bg-white mr-5">
          {!isAssessment ? (
            <div className="flex justify-center items-center  py-5 px-1">
              <button className={`border py-2 px-2 rounded-xl  ${isLoading ? " disabled:opacity-50 bg-blue-500 text-white" : "hover:cursor-pointer hover:bg-blue-600 hover:text-white transition-all duration-300 text-blue-600"}`} onClick={handleStartAssessment}>{buttonText}</button>
            </div>
          ) : (
            <Input setMessages={setChatMessages}/>
          )}
            
        </div>
        </div>
        <ToastContainer/>
       </div>
    </>
  )
}

export default Chat
