import type { Message } from '../types/types'
import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Custom styles for hiding scrollbar while maintaining functionality


// Typing animation component
const TypingAnimation = () => (
  <div className="flex space-x-1">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

// Markdown rendering configuration
const markdownOptions: Partial<Options> = {
  remarkPlugins: [remarkGfm]
};

// TypeWriter component for streaming markdown text
const TypeWriter = ({ text, onTyping }: { text: string, onTyping: (isTyping: boolean) => void }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex === 0) {
      onTyping(true);
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        if (currentIndex % 5 === 0) {
          onTyping(true);
        }
      }, 10);
      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
      onTyping(false);
    }
  }, [currentIndex, text, onTyping]);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown {...markdownOptions}>
        {isComplete ? text : displayText}
      </ReactMarkdown>
    </div>
  );
};

type Props = {
  index: number
  message: Message
  onTyping?: (isTyping: boolean) => void
}

function MessageBubble({index, message, onTyping = () => {}}: Props) {
  const renderText = () => (
    <div className="whitespace-pre-wrap break-words">
      {message.text ? (
        message.isUser ? (
          message.text
        ) : (
          <TypeWriter text={message.text} onTyping={onTyping} />
        )
      ) : (
        <TypingAnimation />
      )}
    </div>
  );

  const renderTranscript = () => (
    message.transcript && (
      <div className="text-sm opacity-90 mt-2 whitespace-pre-wrap break-words text-gray-600 dark:text-gray-300">
        {message.transcript}
      </div>
    )
  );

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
  );

  const renderAudio = () => (
    <div className="flex flex-col gap-2">
      <audio 
        src={message.url} 
        controls 
        controlsList="nodownload noplaybackrate"
        preload="metadata"
        className="w-full max-w-[300px] h-[36px]"
        onError={(e) => {
          const target = e.target as HTMLAudioElement;
          if (target.error) {
            console.error('Audio playback error:', target.error.code);
          }
        }}
      >
        Your browser does not support the audio element.
      </audio>
      {renderTranscript()}
    </div>
  );

  const renderContent = () => {
    if (!message.url) return renderText();

    switch (message.type) {
      case 'video': return renderVideo();
      case 'audio': return renderAudio();
      default: return renderText();
    }
  };

  const bubbleStyle = message.isUser
    ? 'bg-blue-600 text-white rounded-br-none'
    : 'bg-gray-100 text-gray-800 rounded-bl-none';

  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${bubbleStyle}`}>
        {renderContent()}
      </div>
    </div>
  );
}

export default MessageBubble
