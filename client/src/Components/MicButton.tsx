import { useState, useRef } from 'react'
import { Mic, MicOff } from 'react-feather'

function MicButton() {
  const [isMicActive, setIsMicActive] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const enableMicrophone = async (e: React.PointerEvent) => {
    e.preventDefault()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start()
      setIsMicActive(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const disableMicrophone = (e: React.PointerEvent) => {
    e.preventDefault()
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsMicActive(false)
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      console.log('Recording stopped, audio blob created:', audioBlob)
    }
  }

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
