import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'motion/react';
import './Letter.css';
import letter from '../../content/birthdayLetter';
import { playArtifactChime } from '../../utils/archiveAudio';
import { markDiscovered } from '../../utils/discoveryTracker';

const parchmentVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.0,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const contentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const Letter: React.FC = () => {
  useEffect(() => {
    markDiscovered('letter');
  }, []);

  const handleReturn = () => {
    playArtifactChime(392);
  };

  return (
    <main className="letter-scene">
      <motion.article
        className="letter-parchment"
        initial="hidden"
        animate="visible"
        variants={parchmentVariants}
      >
        {/* Letter Header Accent */}
        <div className="letter-header-bar">
          <div className="letter-record-id">
            <span className="record-marker-dot" />
            <span className="record-marker-text">CONFIDENTIAL ARCHIVE RECORD // FILE 01</span>
          </div>
          <div className="letter-seal-group">
            {letter.annotation && (
              <span className="letter-annotation-badge">{letter.annotation}</span>
            )}
            <div className="wax-seal" title="Wax Seal - K">
              <span className="wax-seal-initial">K</span>
            </div>
          </div>
        </div>

        {/* Salutation */}
        <h2 className="letter-greeting">{letter.greeting}</h2>

        {/* Letter Body */}
        <motion.div className="letter-body" variants={contentVariants} initial="hidden" animate="visible">
          {letter.paragraphs.map((paragraph, index) => {
            const isName = paragraph.trim().toLowerCase() === 'your name.';
            const isBirthday = paragraph.includes('Happy Birthday');

            if (isName) {
              return (
                <motion.p key={index} className="letter-paragraph letter-name-highlight" variants={itemVariants}>
                  your name .
                </motion.p>
              );
            }

            if (isBirthday) {
              return (
                <motion.p key={index} className="letter-paragraph letter-birthday-highlight" variants={itemVariants}>
                  {paragraph}
                </motion.p>
              );
            }

            return (
              <motion.p key={index} className="letter-paragraph" variants={itemVariants}>
                {paragraph}
              </motion.p>
            );
          })}
        </motion.div>

        {/* Signoff */}
        <div className="letter-signoff-section">
          <span className="letter-closing">{letter.closing}</span>
          <span className="letter-signature">{letter.signature}</span>
        </div>

        {/* Return Button */}
        <div className="letter-return-container">
          <Link to="/case" onClick={handleReturn} className="letter-return-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            <span>RETURN TO ARCHIVE</span>
          </Link>
        </div>
      </motion.article>
    </main>
  );
};

export default Letter;
