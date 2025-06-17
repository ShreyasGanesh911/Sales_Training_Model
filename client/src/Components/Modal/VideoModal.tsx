import { X } from "react-feather"
import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js';
import { formatTime,getErrorIcon,type MediaError,type Props } from "./VideoFunctions";
import type {UploadVideoResponse } from "../../types/types";
import { uploadMessages } from "../../assets/Constant";
const ENDPOINT = import.meta.env.VITE_SERVER_URL || "";

let smileDetected:boolean = false;

function VideoModal({ setShow, setIsActive, setVideoURL, setTranscript,setMessages }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<number | null>(null)
  const smileCheckIntervalRef = useRef<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null)
  const [error, setError] = useState<MediaError | null>(null)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ success?: boolean; message: string } | null>(null)
  const [uploadMessageIndex, setUploadMessageIndex] = useState(0);

  const checkSmileOnce = async () => {
    if (!videoRef.current) return;
  
    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();
    
      if (detections.length > 0) {
        // Draw face detection boxes
        if (canvasRef.current && videoRef.current) {
          const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight }
          faceapi.matchDimensions(canvasRef.current, displaySize)
          const resizedDetections = faceapi.resizeResults(detections, displaySize)
          
          // Clear previous drawings
          const ctx = canvasRef.current.getContext('2d')
          if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
          
          // Draw the detection boxes and expressions
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections)
          faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections)
        }

        const smiling = detections.some(det => det.expressions.happy > 0.7);
        if (smiling && !smileDetected) {
          smileDetected = true;
          console.log("Smile detected during recording!");
        }
      }
    } catch (error) {
      console.error("Error checking for smile:", error);
    }
  };
  useEffect(() => {
    async function startVideo() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { exact: 320 },
            height: { exact: 240 },
            frameRate: { exact: 12 }
          }, 
          audio: true 
        })
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

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Check for WebGL support with more detailed detection
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
          console.log("WebGL is not supported in your browser. Please try using a different browser like Chrome, Firefox, or Edge.");
          setError({
            type: 'generic',
            message: 'WebGL is not supported in your browser. Please try using a different browser like Chrome, Firefox, or Edge.'
          });
          return;
        }

        // Check if we're using SwiftShader (software rendering)
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          if (renderer && renderer.toLowerCase().includes('swiftshader')) {
            console.log("Using software WebGL (SwiftShader) which may cause performance issues.");
            setError({
              type: 'generic',
              message: 'Your browser is using software-based WebGL which may cause performance issues. Please enable hardware acceleration in your browser settings or try a different browser.'
            });
            return;
          }
        }

        // Create a dummy canvas for warm-up
        const dummyCanvas = document.createElement('canvas');
        dummyCanvas.width = 640;
        dummyCanvas.height = 480;
        const ctx = dummyCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, dummyCanvas.width, dummyCanvas.height);
        }

        // Load models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models')
        ]);
        
        console.log('Face-api models loaded');
        
        // Warm up the models with the dummy canvas
        const dummyImage = await faceapi.fetchImage(dummyCanvas.toDataURL());
        await faceapi
          .detectAllFaces(dummyImage, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();
          
        console.log('Models warmed up successfully');
      } catch (e) {
        console.error('Error loading face-api models', e);
        setError({
          type: 'generic',
          message: 'Failed to initialize face detection. Please try using a different browser or check if your device supports WebGL.'
        });
      }
    };
    loadModels();
  }, []);
  

  const startRecording = () => {
    if (!streamRef.current) return
    setRecordedVideo(null)
    setTimer(0)
    setIsPlaying(false)
    smileDetected = false // Reset smile detection when starting new recording

    if (videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.muted = true
    }

    // Start checking for smiles periodically
    smileCheckIntervalRef.current = window.setInterval(checkSmileOnce, 1000);
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    if(!MediaRecorder.isTypeSupported(options.mimeType)){
      options.mimeType = 'video/webm'
    }
    const mediaRecorder = new MediaRecorder(streamRef.current, options)
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
      smileDetected ? console.log("Smile detected during recording!") : console.log("No smile detected during recording!")
      setIsRecording(false)
      timerRef.current && clearInterval(timerRef.current)
      if (smileCheckIntervalRef.current) {
        clearInterval(smileCheckIntervalRef.current)
        smileCheckIntervalRef.current = null
      }
    }
  }

  const handleClose = () => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    isRecording && stopRecording()
    timerRef.current && clearInterval(timerRef.current)
    if (smileCheckIntervalRef.current) {
      clearInterval(smileCheckIntervalRef.current)
      smileCheckIntervalRef.current = null
    }
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
    const prevMsg = localStorage.getItem('chatMessages')
    let prevMsgArray = JSON.parse(prevMsg || '[]')
    setIsUploading(true)
    setUploadStatus(null)

    // Stop video playback and mute audio when upload starts
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.muted = true
      setIsPlaying(false)
    }

    const formData = new FormData()
    formData.append('video', recordedVideo, 'recorded-video.webm')
    formData.append('messages', JSON.stringify(prevMsgArray))
    formData.append('smileDetected', smileDetected.toString())
    try {
      const response = await fetch(`${ENDPOINT}/api/v1/gpt/video`, {
        method: 'POST',
        body: formData
      })
      
      const data: UploadVideoResponse = await response.json()
      
      if (!response.ok) throw new Error(data.message || 'Upload failed')
      const msg1 = {
        content:data.data.transcript,
        role:'user',
      }
      const msg2 = {
        content:data.data.gptResponse,
        role:'assistant',
      }
      prevMsgArray.push(msg1,msg2)
      localStorage.setItem('chatMessages',JSON.stringify(prevMsgArray))
      
      setTimeout(()=>{
        setMessages(prevMessages => [...prevMessages, {
          text:data.data.gptResponse,
          isUser:false,
          timestamp:new Date(),
          type:'text',
        }])
      },1000)
      setTranscript(data.data.transcript)
      setVideoURL(data.data.url)
      setUploadStatus({ success: true, message: 'Video uploaded successfully!' })
      handleClose()  // Close modal immediately after successful upload
      
    } catch (error) {
      setUploadStatus({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to upload video'
      })
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    if (isUploading) {
      const interval = setInterval(() => {
        setUploadMessageIndex((prev) => (prev + 1) % uploadMessages.length);
      }, 3500);
      return () => clearInterval(interval);
    } else {
      setUploadMessageIndex(0);
    }
  }, [isUploading]);

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-0'>
      <div className="w-full md:w-4/5 lg:w-3/4 xl:w-1/2 min-h-[50vh] sm:h-[70vh] bg-white mt-2 sm:mt-10 relative rounded-lg shadow-lg p-4">
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 text-gray-600 hover:text-gray-800 z-50 cursor-pointer"
          aria-label="Close modal"
        >
          <X size={22} className="pointer-events-none"/>
        </button>

        <div 
          className="fixed inset-0  bg-opacity-50 -z-10" 
          onClick={handleClose}
          aria-hidden="true"
        />

        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-20">
            <div className="text-white text-center flex flex-col items-center gap-4">
              {/* Fun animated emoji (popcorn bounce) */}
              <div className="text-5xl animate-bounce">🍿</div>
              <p className="text-lg font-semibold animate-pulse">{uploadMessages[uploadMessageIndex]}</p>
            </div>
          </div>
        )}

        {uploadStatus && (
          <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-30 px-6 py-3 rounded-lg shadow-lg ${
            uploadStatus.success ? 'bg-green-500' : 'bg-red-500'} text-white text-sm sm:text-base`}>
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
          <div className="relative w-full h-[calc(100%-80px)] flex items-center justify-center">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-contain rounded-lg"
              onEnded={() => setIsPlaying(false)}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full object-contain rounded-lg"
            />
          </div>
        }
        
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-wrap gap-3 sm:gap-4 items-center justify-center w-full px-4">
          {!error && (
            <>
              {isRecording && (
                <div className="bg-white border border-gray-200 shadow-sm text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                  {formatTime(timer)}
                </div>
              )}
              {!isRecording ? (
                recordedVideo ? (
                  <div className="flex flex-wrap gap-3 sm:gap-4 items-center justify-center">
                    <button 
                      onClick={togglePlayback} 
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow text-sm sm:text-base font-medium"
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button 
                      onClick={restartVideo} 
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow text-sm sm:text-base font-medium"
                    >
                      Restart
                    </button>
                    <button 
                      onClick={startRecording} 
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow text-sm sm:text-base font-medium"
                    >
                      Record New
                    </button>
                    <button 
                      onClick={uploadVideo} 
                      disabled={isUploading}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 text-sm sm:text-base font-medium ${
                        isUploading 
                          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' 
                          : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"/>
                          Uploading...
                        </>
                      ) : (
                        'Upload Video'
                      )}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={startRecording} 
                    className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow text-sm sm:text-base font-medium"
                  >
                    <span className="h-2 w-2 rounded-full bg-red-500"/> 
                    Start Recording
                  </button>
                )
              ) : (
                <button 
                  onClick={stopRecording} 
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow text-sm sm:text-base font-medium"
                >
                  <span className="h-3 w-3 bg-gray-600 rounded"/> 
                  Stop Recording
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
