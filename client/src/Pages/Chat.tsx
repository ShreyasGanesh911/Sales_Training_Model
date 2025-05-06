import { useRef } from "react";
import Input from "../Components/Input";
import MicButton from "../Components/MicButton";

const Chat = () => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
  return (
    <>
       <div className="flex justify-center items-start min-h-screen bg-gray-50 p-4">
       <div className="w-full 2xl:max-w-[40%] xl:max-w-[70%] relative h-[95vh] bg-white rounded-2xl shadow-lg">
        {/* <div ref={chatContainerRef} className="h-full overflow-y-auto pb-40 px-6 pt-6">
          {messages.map((message, index) => (
            <MessageBubble  key={message.id || index} index={index}  message={message}
              currentText={message.id === currentMessageId ? currentText : message.text}/>
          ))}
        //   <div ref={messagesEndRef} />
        </div> */}
        <div className="absolute bottom-0.5 w-full left-0  rounded-2xl right-0 px-6 bg-white mr-5">
            {/* <SessionControls   startSession={startSession} stopSession={stopSession}
              sendClientEvent={sendClientEvent} sendTextMessage={sendTextMessage}
              serverEvents={events} isSessionActive={isSessionActive} />
            {isSessionActive && <MicButton disableMicrophone={disableMicrophone} enableMicrophone={enableMicrophone} isMicActive={isMicActive}/> } */}
            <Input/>
            {/* <MicButton isMicActive={false} enableMicrophone={() => {}} disableMicrophone={() => {}}/> */}
            
        </div>
        </div>
       </div>
    </>
  )
}

export default Chat
