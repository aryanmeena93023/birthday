import React from 'react';
import { Link } from 'react-router-dom';
import './ArchiveFieldGuide.css';
import {
  pauseAndResetArchiveSoundtrack,
  playArtifactChime,
  playLetterOpeningSound
} from '../../utils/archiveAudio';

interface FieldGuideItem {
  number: string;
  name: string;
  path: string;
  pitch: number;
  isLetter?: boolean;
}

const GUIDE_ITEMS: FieldGuideItem[] = [
  { number: '01', name: 'SEALED LETTER', path: '/letter', pitch: 523.25, isLetter: true },
  { number: '02', name: 'MEMORY BOX', path: '/memories', pitch: 440.00 },
  { number: '03', name: 'THE OWL', path: '/raven', pitch: 329.63 },
  { number: '04', name: 'RADIO AUDIO', path: '/audio', pitch: 587.33 },
  { number: '05', name: 'CIPHER BOX', path: '/forbidden', pitch: 293.66 },
  { number: '06', name: 'DESK DRAWER', path: '/drawer', pitch: 349.23 },
];

/**
 * ArchiveFieldGuide
 * Visual navigation sequence panel for Page 2 (The Archive Chamber).
 * Allows users to easily identify and click files to navigate the archive.
 */
export const ArchiveFieldGuide: React.FC = () => {
  const handleItemClick = (item: FieldGuideItem) => {
    pauseAndResetArchiveSoundtrack();
    if (item.isLetter) {
      playLetterOpeningSound();
    } else {
      playArtifactChime(item.pitch);
    }
  };

  return (
    <aside
      className="archive-field-guide-panel"
      aria-label="Archive Field Guide"
    >
      <div className="archive-field-guide-card">
        {/* Inset delicate frame border */}
        <div className="archive-field-guide-inner-border" aria-hidden="true" />

        {/* Ornamental cut corners */}
        <span className="archive-field-guide-corner top-left" aria-hidden="true" />
        <span className="archive-field-guide-corner top-right" aria-hidden="true" />
        <span className="archive-field-guide-corner bottom-left" aria-hidden="true" />
        <span className="archive-field-guide-corner bottom-right" aria-hidden="true" />

        <div className="archive-field-guide-content">
          <h2 className="archive-field-guide-title">ARCHIVE FIELD GUIDE</h2>
          <p className="archive-field-guide-subtitle">SELECT A FILE TO EXPLORE</p>

          <div className="archive-field-guide-divider" aria-hidden="true">
            <span className="archive-field-guide-divider-line" />
            <span className="archive-field-guide-divider-ornament" />
            <span className="archive-field-guide-divider-line" />
          </div>

          <nav className="archive-field-guide-nav" aria-label="Archive files">
            <ol className="archive-field-guide-list">
              {GUIDE_ITEMS.map((item) => (
                <li key={item.number} className="archive-field-guide-item-wrapper">
                  <Link
                    to={item.path}
                    onClick={() => handleItemClick(item)}
                    className="archive-field-guide-link"
                    aria-label={`Open file ${item.number} - ${item.name}`}
                  >
                    <span className="archive-field-guide-num">{item.number}</span>
                    <span className="archive-field-guide-name">{item.name}</span>
                    <span className="archive-field-guide-arrow" aria-hidden="true">›</span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          {/* Bottom guidance line */}
          <div className="archive-field-guide-footer">
            <span className="archive-field-guide-footer-text">
              SEQUENCE TO EXPLORE THE ARTIFACTS
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ArchiveFieldGuide;
