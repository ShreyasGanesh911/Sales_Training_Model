import { useEffect, useRef, useState } from "react";
import Input from "../Components/Input";
import MessageBubble from "../Components/MessageBubble";
import { sales_script } from "../assets/script";
import { ToastContainer } from "react-toastify";
import type { Message,GPTMessage } from "../types/types";
import { toastError,toastSuccess } from "../Toast/toast";
const URL = import.meta.env.VITE_SERVER_URL || ""
import { ChevronDown } from "react-feather";
import { welcomeMessage } from "../assets/Constant";

const Chat = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAssessment, setIsAssessment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);
  const lastScrollPosition = useRef<number>(0);
  const [buttonText, setButtonText] = useState("Start Assessment");
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      isUser:false,
      text:welcomeMessage,
      timestamp:new Date(),
      type:'text',
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setUserScrolled(false);
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
    
    // Detect scroll direction
    const isScrollingUp = scrollTop < lastScrollPosition.current;
    lastScrollPosition.current = scrollTop;

    // Only update userScrolled if they're actually scrolling up
    if (isScrollingUp && !isAtBottom) {
      setUserScrolled(true);
    }

    setShowScrollButton(!isAtBottom);
  };

  // Handle typing state changes
  const handleTyping = (typing: boolean) => {
    setIsTyping(typing);
    if (typing && !userScrolled) {
      scrollToBottom();
    }
  };

  const checkMicAccess = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if(permission.state === 'granted'){
        console.log('Microphone access granted');
      }
      if (permission.state === 'prompt') {
        // Try to get access
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (error) {
      toastError("Microphone access denied")
      console.log(error)
    }
  }
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify([]))
    checkMicAccess()
  }, []);

  useEffect(() => {
    // Only auto-scroll for new messages if we're at the bottom or typing
    if (!userScrolled || (isTyping && chatMessages[chatMessages.length - 1]?.isUser === false)) {
      scrollToBottom();
    }
  }, [chatMessages, isTyping]);

  // Add scroll event listener
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleStartAssessment = async(e:React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setButtonText("Starting assessment...");
    const msg1:GPTMessage = {
      content:sales_script,
      role:'system'
    }
    const response = await fetch(`${URL}/api/v1/gpt/assessment`,{
      method:"POST",
    });
    if(!response.ok){
      toastError("Failed to start assessment")
      setIsLoading(false)
      return
    }
    toastSuccess("Assessment started")
    const data = await response.json();
    const msg2:GPTMessage = {
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
        {showScrollButton && !isTyping && (
          <button 
            onClick={scrollToBottom}
            className="border border-gray-200 rounded-full bg-white p-2 absolute bottom-24 right-4 hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg"
            aria-label="Scroll to bottom"
          >
           <ChevronDown className="text-gray-600" size={20} />
          </button>
        )}
        <div 
          ref={chatContainerRef} 
          className="h-full overflow-y-auto pb-40 px-6 pt-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          onScroll={handleScroll}
        >
          {chatMessages.map((message, index) => (
            <MessageBubble 
              key={index} 
              index={index} 
              message={message}
              onTyping={handleTyping}
            />
          ))}
           <div ref={messagesEndRef} />
        </div>
        <div className="absolute bottom-0.5 w-full left-0 rounded-2xl right-0 px-6 bg-white mr-5">
          {!isAssessment ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Ready to Start?</h2>
              <p className="text-gray-600 mb-6 text-center">Click the button below to begin your assessment</p>
              <button 
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl text-base font-medium
                  shadow-md hover:shadow-lg transition-all duration-300
                  ${isLoading 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-blue-500 hover:bg-blue-600 text-white hover:scale-105"
                  }
                `} 
                onClick={handleStartAssessment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"/>
                    {buttonText}
                  </>
                ) : (
                  buttonText
                )}
              </button>
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
