import { useState } from 'react'
import { Video, VideoOff } from 'react-feather'
import VideoModal from './Modal/VideoModal'

function VideoButton() {
  const [isActive, setIsActive] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleVideoClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setShowModal(true)
    setIsActive(true)
  }

  return (
    <>
      {showModal && <VideoModal setShow={setShowModal} setIsActive={setIsActive} />}
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
