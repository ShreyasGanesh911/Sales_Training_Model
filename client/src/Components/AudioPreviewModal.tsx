import { Send, X } from 'react-feather'
import { useRef } from 'react'

interface AudioPreviewModalProps {
  previewUrl: string;
  onSend: () => void;
  onCancel: () => void;
}

const AudioPreviewModal = ({ previewUrl, onSend, onCancel }: AudioPreviewModalProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSend = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onSend();
  };

  const ActionButton = ({ onClick, icon: Icon, color, title }: { 
    onClick: () => void; 
    icon: typeof Send | typeof X; 
    color: string; 
    title: string;
  }) => (
    <button
      onClick={onClick}
      className={`p-1.5 bg-${color}-500/20 text-${color}-500 rounded-full hover:bg-${color}-500/30 transition-colors`}
      title={title}
    >
      <Icon size={14} className="sm:w-4 sm:h-4" />
    </button>
  )

  return (
    <div className="fixed sm:absolute bottom-24 sm:bottom-full left-1/2 -translate-x-1/2 sm:-translate-x-0 sm:-left-80 mb-2 bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg shadow-lg flex items-center gap-2 w-[280px] sm:w-auto z-50">
      <audio 
        ref={audioRef}
        src={previewUrl} 
        controls 
        className="h-8 sm:h-10 flex-1 max-w-full" 
      />
      <div className="flex gap-1 shrink-0">
        <ActionButton 
          onClick={handleSend} 
          icon={Send} 
          color="green" 
          title="Send recording" 
        />
        <ActionButton 
          onClick={onCancel} 
          icon={X} 
          color="red" 
          title="Cancel recording" 
        />
      </div>
    </div>
  )
}

export default AudioPreviewModal 