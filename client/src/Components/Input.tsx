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
    // Reset textarea height to original
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = '40px';
    }
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <>
      <div className="flex items-center justify-center w-full h-full gap-4 bg-white">
        <div className="absolute bottom-1 left-0 right-0 rounded-2xl mb-[-6px] bg-white mx-2 pb-4 flex items-center justify-center">
          <div className="flex items-center gap-2 p-1 w-full shadow-lg border border-gray-100 sm:pr-4 pr-2 bg-white rounded-xl">
            <div className='w-[70%] sm:w-4/5 flex flex-col'>
              <textarea 
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full px-2 sm:px-4 py-2 sm:py-4 bg-transparent rounded-xl text-gray-700 placeholder-gray-400 outline-none resize-none h-auto min-h-[40px] sm:min-h-[60px] max-h-[150px] overflow-y-auto"
                value={message} 
                onChange={(e) => {
                  setMessage(e.target.value);
                  // Auto-adjust height up to max-height
                  e.target.style.height = 'auto';
                  const newHeight = Math.min(e.target.scrollHeight, 150);
                  e.target.style.height = `${newHeight}px`;
                }}
                disabled={isLoading}
                rows={1}
              />
            </div>
            <div id='Buttons' className='w-[30%] sm:w-1/5 flex items-end justify-end self-end sm:pb-2 pb-1'>
              <div className='flex flex-row gap-1 sm:gap-2'>
                <button 
                  onClick={handleSubmit}
                  disabled={!message.trim() || isLoading}
                  className="p-1 sm:p-2 rotate-45 text-blue-500 hover:text-blue-800 transition-colors hover:cursor-pointer duration-200 disabled:text-gray-300"
                >
                  <Send height={18} className="sm:h-[21px]" />
                </button>
                <MicButton setMessages={setMessages} />
                <VideoButton setMessages={setMessages}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Input
