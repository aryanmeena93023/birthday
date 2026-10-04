import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import './CinematicIntro.css';

const CinematicIntro: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const handleEnterClick = () => {
    if (hasEntered) return;
    setHasEntered(true);
    
    // Slight delay to allow UI to fade out before revealing the video
    setTimeout(() => {
      setIsVideoVisible(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(error => {
          console.error("Video playback failed:", error);
        });
      }
    }, 500);
  };

  const handleVideoEnded = () => {
    setIsEnding(true);
    
    // Wait for dark fade to complete before navigating
    setTimeout(() => {
      navigate('/case');
    }, 800);
  };

  return (
    <div className="cinematic-container">
      {/* Landing Image */}
      <motion.img 
        src="/media/nuluja-landing.webp"
        alt="Nuluja Assam Landing"
        className="media-layer image-layer"
        initial={{ scale: 1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
      />
      
      {/* Video Layer */}
      <video
        ref={videoRef}
        src="/media/nuluja-intro.mp4"
        className={`media-layer video-layer ${isVideoVisible ? 'visible' : ''}`}
        playsInline
        preload="auto"
        onEnded={handleVideoEnded}
        muted={false} /* Consider muting if browsers block unmuted autoplay, though it's on click here */
      />

      {/* Overlay */}
      <AnimatePresence>
        {!hasEntered && (
          <motion.div 
            className="overlay-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        )}
      </AnimatePresence>

      {/* UI Layer */}
      <AnimatePresence>
        {!hasEntered && (
          <motion.div 
            className="ui-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.6 }}
          >
            <motion.button 
              className="enter-button"
              onClick={handleEnterClick}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              aria-label="Enter Nuluja Assam"
            >
              ENTER
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ending Dark Fade */}
      <AnimatePresence>
        {isEnding && (
          <motion.div 
            className="dark-fade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CinematicIntro;
