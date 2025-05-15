import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Video} from 'react-feather'
import VideoModal from './Modal/VideoModal'
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

function VideoButton({setMessages}:Props) {
  const [isActive, setIsActive] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [videoURL, setVideoURL] = useState<string>("")
  const [transcript, setTranscript] = useState<string>("")
  const handleVideoClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setShowModal(true)
    setIsActive(true)
  }
  useEffect(()=>{
    if(videoURL && transcript){
      setMessages(prevMessages => [...prevMessages, {
        text: transcript,
        isUser: true,
        timestamp: new Date(),
        type: 'video',
        url: videoURL
      }])
    }
  },[videoURL,transcript])
  return (
    <>
      {showModal && <VideoModal setShow={setShowModal} setMessages={setMessages} setVideoURL={setVideoURL} setTranscript={setTranscript} setIsActive={setIsActive} />}
      <button
        onClick={handleVideoClick}
        className="sm:p-1 p-1 text-blue-500 hover:text-blue-800 transition-colors hover:cursor-pointer duration-200 disabled:text-gray-300"
      >
        {isActive ? (
          <Video size={19} className="bg-blue-500 rounded-full text-white animate-pulse ring-4 ring-blue-300 ring-opacity-50" />
        ) : (
          <Video size={19} />
        )}
      </button>
    </>
  )
}

export default VideoButton
