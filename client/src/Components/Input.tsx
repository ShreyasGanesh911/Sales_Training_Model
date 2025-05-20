import { useState} from 'react'
import {Send} from "react-feather";
import MicButton from './MicButton';
import VideoButton from './VideoButton';
import type {SetMessageProps } from '../types/types';
import { toastError } from '../Toast/toast';
const ENDPOINT = import.meta.env.VITE_SERVER_URL || "";

function Input({setMessages}: SetMessageProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async() => {
    const prevMsg = localStorage.getItem('chatMessages')
    let prevMsgArray = JSON.parse(prevMsg || '[]')
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
      const response = await fetch(`${ENDPOINT}/api/v1/gpt/text`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          text:userText,
          messages:prevMsgArray
        })
      })
      if(!response.ok){
        toastError("Failed to send message")
        throw new Error('Failed to send message')
      }
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
      const msg1 = {
        content:userText,
        role:'user',
      }
      const msg2 = {
        content:data.data,
        role:'assistant',
      }
      prevMsgArray.push(msg1,msg2)
      localStorage.setItem('chatMessages',JSON.stringify(prevMsgArray))
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
                <Send height={21} />
              </button>
              <MicButton setMessages={setMessages}  />
              <VideoButton setMessages={setMessages}/>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Input
