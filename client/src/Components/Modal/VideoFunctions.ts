import type { Message } from "../../types/types"

export   const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  export interface MediaError  {
    type: 'camera' | 'microphone' | 'both' | 'generic'
    message: string
  }
  export type Props = {
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    setIsActive: React.Dispatch<React.SetStateAction<boolean>>
    setVideoURL: React.Dispatch<React.SetStateAction<string>>
    setTranscript: React.Dispatch<React.SetStateAction<string>>
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  }
  
  export const getErrorIcon = (type: MediaError['type']) => {
    switch (type) {
      case 'microphone': return '🎤'
      case 'camera': return '📷'
      case 'both': return '📹'
      default: return '⚠️'
    }
  }