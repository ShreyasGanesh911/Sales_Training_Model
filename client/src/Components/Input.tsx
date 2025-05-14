import { useState, type Dispatch, type SetStateAction } from 'react'
import {Send} from "react-feather";
import MicButton from './MicButton';
import VideoButton from './VideoButton';
import useLocalStorage from '../hooks/useLocalStorage';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  type: 'text' | 'video' | 'audio'
  url?: string
}

type Props = {
  setMessages: Dispatch<SetStateAction<Message[]>>
}

// Typing animation component
const TypingAnimation = () => (
  <div className="flex items-center space-x-2 p-4">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
  </div>
);

function Input({setMessages}: Props) {
  const { addMessage,messages } = useLocalStorage('chatMessages');
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async() => {
    if (!message.trim()) return
    const userText = message;
    setMessage("")
    setMessages(prev => [...prev, {
      text: userText,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    }])

    // Show typing animation
    setIsLoading(true);
    setMessages(prev => [...prev, {
      text: '',
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }])

    try {
      const response = await fetch("http://localhost:8000/api/v1/gpt/text",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          text:userText,
          messages:messages
        })
      })
      const data = await response.json();
      
      // Remove the typing indicator and add the actual response
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          text: data.data,
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        };
        return newMessages;
      });

      addMessage({
        content: userText,
        role: 'user'
      })
    } catch (error) {
      console.error('Error:', error);
      // Remove the typing indicator on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <>
      <div className="flex items-center justify-center w-full h-full gap-4 bg-white">
        <div className="absolute bottom-1 left-0 right-0 rounded-2xl mb-[-6px] bg-white mx-2 pb-4 flex items-center justify-center">
          <div className="flex items-center sm:gap-2 gap-1 p-1 w-full rounded-full shadow-lg border border-gray-100 sm:pr-4 pr-2 bg-white">
            <input 
              onKeyDown={handleKeyDown}
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-4 bg-transparent rounded-full text-gray-700 placeholder-gray-400 outline-none"
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
            />
            <div id='Buttons' className='bg-white'>
              <button 
                onClick={handleSubmit}
                disabled={!message.trim() || isLoading}
                className="sm:p-1 p-1 rotate-45 text-blue-500 hover:text-blue-800 transition-colors hover:cursor-pointer duration-200 disabled:text-gray-300"
              >
                <Send height={19} />
              </button>
              <MicButton setMessages={setMessages} />
              <VideoButton setMessages={setMessages}/>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Input
