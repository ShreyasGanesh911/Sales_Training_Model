import { useState, useRef} from 'react'
import { Mic, MicOff, Loader } from 'react-feather'
import { toastError } from '../Toast/toast';
import type { AudioResponse, SetMessageProps } from '../types/types';
import AudioPreviewModal from './AudioPreviewModal';

const ENDPOINT = import.meta.env.VITE_SERVER_URL || "";
const AUDIO_MIME_TYPE = 'audio/webm;codecs=opus';

function MicButton({ setMessages }: SetMessageProps) {
  const [isMicActive, setIsMicActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: AUDIO_MIME_TYPE })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: AUDIO_MIME_TYPE })
        const audioUrl = URL.createObjectURL(audioBlob)
        setPreviewUrl(audioUrl)
      }

      mediaRecorder.start(100)
      setIsMicActive(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toastError("Failed to access microphone")
    }
  }

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return

    mediaRecorderRef.current.stop()
    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    setIsMicActive(false)
  }

  const toggleMicrophone = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isMicActive) {
      stopRecording()
    } else {
      await startRecording()
    }
  }

  const sendRecording = async () => {
    if (!previewUrl) return

    try {
      setIsProcessing(true)
      setPreviewUrl(null) // Hide modal immediately when sending starts
      const audioBlob = new Blob(audioChunksRef.current, { type: AUDIO_MIME_TYPE })
      const prevMsgArray = JSON.parse(localStorage.getItem('chatMessages') || '[]')
      
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recorded-audio.webm')
      formData.append('messages', JSON.stringify(prevMsgArray))

      const response = await fetch(`${ENDPOINT}/api/v1/gpt/audio`, {
        method: 'POST',
        body: formData
      })

      const data: AudioResponse = await response.json()
      console.log(data)
      if (!response.ok && data.message.includes("text")) {
        toastError("No text detected in the audio")
        return
      }

      if (data.data.url && data.data.transcript) {
        const messages = [
          { content: data.data.transcript, role: "user" },
          { content: data.data.gptResponse, role: "assistant" }
        ]
        
        // Update local storage
        localStorage.setItem('chatMessages', JSON.stringify([...prevMsgArray, ...messages]))

        // Add messages to UI
        setMessages(prev => [
          ...prev,
          {
            text: data.data.transcript,
            isUser: true,
            timestamp: new Date(),
            type: 'audio',
            url: data.data.url,
            transcript: data.data.transcript
          },
          {
            text: data.data.gptResponse,
            isUser: false,
            timestamp: new Date(),
            type: 'text',
          }
        ])
      }
    } catch (error) {
      console.error('Error uploading audio:', error)
      toastError("Failed to upload audio")
    } finally {
      setIsProcessing(false)
    }
  }

  const cancelRecording = () => {
    setPreviewUrl(null)
    audioChunksRef.current = []
  }

  return (
    <div className="relative pt-0.5">
      <button
        onClick={toggleMicrophone}
        className={`
          p-2 sm:p-2.5  rounded-full transition-all duration-200 
          ${isMicActive 
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-110 hover:bg-blue-600' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-red-500'
          }
          ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <div className="relative">
            <Loader size={20} className="animate-spin text-blue-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        ) : isMicActive ? (
          <div className="relative">
            <Mic size={20} className="animate-pulse" />
            <div className="absolute -inset-1 rounded-full border-2 border-white/50 animate-ping"></div>
          </div>
        ) : (
          <MicOff size={20} className="transform transition-transform" />
        )}
      </button>

      {previewUrl && (
        <AudioPreviewModal
          previewUrl={previewUrl}
          onSend={sendRecording}
          onCancel={cancelRecording}
        />
      )}
    </div>
  )
}

export default MicButton
