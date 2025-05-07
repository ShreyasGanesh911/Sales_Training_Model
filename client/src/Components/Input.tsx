import { useState, type Dispatch, type SetStateAction } from 'react'
import { Video, Send, MicOff, CloudOff, VideoOff } from "react-feather";
import MicButton from './MicButton';
import VideoButton from './VideoButton';

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

function Input({setMessages}: Props) {
    const [message, setMessage] = useState("");

    const handleSubmit = () => {
        if (!message.trim()) return

        setMessages(prev => [...prev, {
            text: message.trim(),
            isUser: true,
            timestamp: new Date(),
            type: 'text'
        }])
        setMessage("")
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <>
        <div className="flex items-center justify-center w-full  h-full gap-4 bg-white  ">
          <div className="absolute bottom-1 left-0 right-0 rounded-2xl mb-[-6px] bg-white mx-2 pb-4 flex items-center justify-center">
            <div className="flex items-center sm:gap-2 gap-1 p-1 w-full  rounded-full shadow-lg border border-gray-100 sm:pr-4 pr-2 bg-white">
             <input onKeyDown={handleKeyDown}
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-4 py-4 bg-transparent  rounded-full text-gray-700 placeholder-gray-400 outline-none"
            value={message} onChange={(e) => setMessage(e.target.value)}/>
           <div id='Buttons' className='bg-white '>
        {/* Send Button */}
          <button 
            onClick={handleSubmit}
            disabled={!message.trim()}
            className="sm:p-1 p-1 rotate-45 text-blue-500 hover:text-blue-800 transition-colors hover:cursor-pointer duration-200 disabled:text-gray-300">
             <Send height={19} />
          </button>
         <MicButton setMessages={setMessages} />
         <VideoButton setMessages={setMessages}/>
          {/* Disconnect */}
          {/* <button  className=" text-red-500 hover:cursor-pointer hover:text-red-600 pr-2"> <CloudOff height={19} /> </button> */}

           </div>
              </div>
              </div>
        </div>      
        </>
    )
}

export default Input
