import { useState, useRef, type Dispatch, type SetStateAction, useEffect } from 'react'
import { Mic, MicOff } from 'react-feather'
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

type AudioResponse = {
  success: boolean;
  message: string;
  data: {
    transcript: string;
    url: string;
  }
}

function MicButton({setMessages}:Props) {
  const [isMicActive, setIsMicActive] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [url, setUrl] = useState<string>("")
  const [transcript, setTranscript] = useState<string>("")

  const enableMicrophone = async (e: React.PointerEvent) => {
    e.preventDefault()
    // Reset states when starting new recording
    setUrl("")
    setTranscript("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start(100) // Record in 100ms chunks
      setIsMicActive(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const disableMicrophone = async (e: React.PointerEvent) => {
    e.preventDefault()
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return

    return new Promise<void>((resolve) => {
      if (!mediaRecorderRef.current) return resolve()

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' })
        // console.log('Audio details:', {
        //   type: audioBlob.type,
        //   size: audioBlob.size,
        //   chunks: audioChunksRef.current.length
        // })
        
        try {
          const formData = new FormData()
          formData.append('audio', audioBlob, 'recorded-audio.webm')

          const response = await fetch('http://localhost:8000/api/v1/gpt/audio', {
            method: 'POST',
            body: formData
          })

          const data: AudioResponse = await response.json()
          // console.log('Audio upload response:', data)

          if (!response.ok) throw new Error(data.message || 'Upload failed')

          if (data.data.url && data.data.transcript) {
            setUrl(data.data.url)
            setTranscript(data.data.transcript)
          }

        } catch (error) {
          console.error('Error uploading audio:', error)
          // Reset states on error
          setUrl("")
          setTranscript("")
        }
        resolve()
      }

      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsMicActive(false)
    })
  }

  useEffect(() => {
    if (url && transcript) {
      setMessages(prevMessages => [...prevMessages, {
        text: transcript,
        isUser: true,
        timestamp: new Date(),
        type: 'audio',
        url: url
      }])
      // Reset states after adding message
      setUrl("")
      setTranscript("")
    }
  }, [url, transcript, setMessages])

  return (
    <>
      <button
        onPointerDown={enableMicrophone}
        onPointerUp={disableMicrophone}
        onPointerLeave={disableMicrophone}
        className="sm:p-1 p-1 text-red-500 rounded-full hover:text-red-800 transition-colors hover:cursor-pointer duration-200 disabled:text-gray-300"
      >
        {isMicActive ? 
          <Mic size={19} className="bg-blue-500 rounded-full text-white animate-pulse ring-4 ring-blue-300 ring-opacity-50" /> 
          :
          <MicOff size={19} />
        }
      </button>
    </>
  )
}

export default MicButton
