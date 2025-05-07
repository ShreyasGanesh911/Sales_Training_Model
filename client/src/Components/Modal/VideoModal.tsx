import { X } from "react-feather"
import { useEffect, useRef, useState } from 'react'

type Props = {
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>
  setVideoURL: React.Dispatch<React.SetStateAction<string>>
  setTranscript: React.Dispatch<React.SetStateAction<string>>
}

type MediaError = {
  type: 'camera' | 'microphone' | 'both' | 'generic'
  message: string
}

type UploadVideoResponse = {
  success: boolean
  message: string
  data: {
    transcript: string
    url: string
  }
}

function VideoModal({ setShow, setIsActive, setVideoURL, setTranscript }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null)
  const [error, setError] = useState<MediaError | null>(null)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ success?: boolean; message: string } | null>(null)

  useEffect(() => {
    async function startVideo() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.muted = true
        }
        streamRef.current = stream
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') {
            try {
              const videoOnlyStream = await navigator.mediaDevices.getUserMedia({ video: true })
              videoOnlyStream.getTracks().forEach(track => track.stop())
              setError({
                type: 'microphone',
                message: err.name === 'NotAllowedError' 
                  ? 'Microphone access denied. Please allow microphone access in your browser settings to record with audio.'
                  : 'No microphone found. Please connect a microphone to record with audio.'
              })
            } catch {
              setError({
                type: 'both',
                message: err.name === 'NotAllowedError'
                  ? 'Camera and microphone access denied. Please allow access to both devices.'
                  : 'No camera or microphone found. Please connect both devices and try again.'
              })
            }
          } else {
            setError({
              type: 'generic',
              message: 'Error accessing media devices. Please check your device connections and try again.'
            })
          }
        }
      }
    }
    startVideo()
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop())
      timerRef.current && clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (timer >= 60) stopRecording()
  }, [timer])

  const startRecording = () => {
    if (!streamRef.current) return
    setRecordedVideo(null)
    setTimer(0)
    setIsPlaying(false)

    if (videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.muted = true
    }

    const mediaRecorder = new MediaRecorder(streamRef.current)
    mediaRecorderRef.current = mediaRecorder
    const chunks: Blob[] = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      setRecordedVideo(blob)
      timerRef.current && clearInterval(timerRef.current)
      if (videoRef.current) {
        videoRef.current.srcObject = null
        videoRef.current.src = URL.createObjectURL(blob)
        videoRef.current.muted = false
      }
    }

    mediaRecorder.start()
    setIsRecording(true)
    timerRef.current = window.setInterval(() => setTimer(prev => prev + 1), 1000)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      timerRef.current && clearInterval(timerRef.current)
    }
  }

  const handleClose = () => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    isRecording && stopRecording()
    timerRef.current && clearInterval(timerRef.current)
    setShow(false)
    setIsActive(false)
  }

  const togglePlayback = () => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play()
      setIsPlaying(!isPlaying)
    }
  }

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const uploadVideo = async () => {
    if (!recordedVideo) return
    setIsUploading(true)
    setUploadStatus(null)
    const formData = new FormData()
    formData.append('video', recordedVideo, 'recorded-video.webm')

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/gpt/video`, {
        method: 'POST',
        body: formData
      })
      
      const data: UploadVideoResponse = await response.json()
      
      if (!response.ok) throw new Error(data.message || 'Upload failed')
      setTranscript(data.data.transcript)
      setVideoURL(data.data.url)
      setUploadStatus({ success: true, message: 'Video uploaded successfully!' })
      // Close the modal after 1 second on success
      setTimeout(() => {
        handleClose()
      }, 1000)
      
    } catch (error) {
      setUploadStatus({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to upload video'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getErrorIcon = (type: MediaError['type']) => {
    switch (type) {
      case 'microphone': return '🎤'
      case 'camera': return '📷'
      case 'both': return '📹'
      default: return '⚠️'
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-center'>
      <div className="w-1/2 h-1/2 bg-white mt-10 relative rounded-lg shadow-lg p-4">
        <button onClick={handleClose} className="absolute top-4 right-4 p-2 hover:text-red-500 transition-colors z-10">
          <X size={22}/>
        </button>

        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-20">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-3"></div>
              <p>Uploading video...</p>
            </div>
          </div>
        )}

        {uploadStatus && (
          <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-30 px-6 py-3 rounded-lg ${
            uploadStatus.success ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {uploadStatus.message}
          </div>
        )}

        {error ? <div className="w-full h-full flex items-center justify-center">
          <div className="text-center p-6 bg-red-50 rounded-lg">
            <p className="text-red-600 font-medium mb-2">{getErrorIcon(error.type)} Media Error</p>
            <p className="text-gray-600">{error.message}</p>
          </div>
        </div>
        : 
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-contain rounded-lg"
            onEnded={() => setIsPlaying(false)}
          />
        }
        
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 items-center">
          {!error && (
            <>
              {isRecording && (
                <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {formatTime(timer)}
                </div>
              )}
              {!isRecording ? (
                recordedVideo ? (
                  <div className="flex gap-4 items-center">
                    <button onClick={togglePlayback} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button onClick={restartVideo} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors">
                      Restart
                    </button>
                    <button onClick={startRecording} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
                      Record New
                    </button>
                    <button 
                      onClick={uploadVideo} 
                      disabled={isUploading}
                      className={`bg-green-500 text-white px-4 py-2 rounded-md transition-colors ${
                        isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
                      }`}
                    >
                      Upload Video
                    </button>
                  </div>
                ) : (
                  <button onClick={startRecording} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-white"/> Start Recording 
                  </button>
                )
              ) : (
                <button onClick={stopRecording} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2">
                  <span className="h-3 w-3 bg-white"/> Stop Recording
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoModal
