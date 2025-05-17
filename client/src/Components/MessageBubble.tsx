import type { Message } from '../types/types'
// Typing animation component
const TypingAnimation = () => (
  <div className="flex space-x-1">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

type Props = {
    index: number
    message: Message
}

function MessageBubble({index, message}: Props) {
  const renderText = () => (
    <div className="whitespace-pre-wrap break-words">
      {message.text ? (
        message.isUser ? message.text : <div dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, "<br>") }} />
      ) : (
        <TypingAnimation />
      )}
    </div>
  )

  const renderTranscript = () => (
    message.text && (
      <div className="text-sm opacity-90 mt-1 whitespace-pre-wrap break-words">
        {message.text}
      </div>
    )
  )

  const renderVideo = () => (
    <div className="flex flex-col gap-2">
      <video 
        src={message.url} 
        controls 
        className="max-w-full rounded-lg w-[240px]"
        style={{ maxHeight: '180px' }}
      >
        Your browser does not support the video element.
      </video>
      {renderTranscript()}
    </div>
  )

  const renderAudio = () => (
    <div className="flex flex-col gap-2">
      <audio 
        src={message.url} 
        controls 
        controlsList="nodownload noplaybackrate"
        preload="metadata"
        className="w-full max-w-[300px] h-[36px]"
        onError={(e) => {
          const target = e.target as HTMLAudioElement
          if (target.error) {
            console.error('Audio playback error:', target.error.code)
          }
        }}
      >
        Your browser does not support the audio element.
      </audio>
      {renderTranscript()}
    </div>
  )

  const renderContent = () => {
    if (!message.url) return renderText()

    switch (message.type) {
      case 'video': return renderVideo()
      case 'audio': return renderAudio()
      default: return renderText()
    }
  }

  const bubbleStyle = message.isUser
    ? 'bg-blue-600 text-white rounded-br-none'
    : 'bg-gray-100 text-gray-800 rounded-bl-none'

  return (
    <div
      key={index}
      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${bubbleStyle}`}>
        {renderContent()}
      </div>
    </div>
  )
}

export default MessageBubble
