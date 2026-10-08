import React from 'react';
import './AudioMemory.css';

interface CaptionFrameProps {
  title: string;
  subHeader?: string;
  messageLines: string[];
}

export const CaptionFrame: React.FC<CaptionFrameProps> = ({
  title,
  subHeader = "MANUSCRIPT FOLIO // POETIC TESTAMENT",
  messageLines = [],
}) => {
  return (
    <section className="caption-frame-section">
      <div className="caption-frame-card manuscript-card">
        {/* Archival Manuscript Card Header */}
        <div className="caption-card-header">
          <div className="caption-header-title-group">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="book-icon" aria-hidden="true">
              <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
            </svg>
            <span className="caption-header-title">TESTAMENT DEPOSIT // AUDIO</span>
          </div>
          <span className="archival-seal-tag">AUTHENTICATED RECORD</span>
        </div>

        {/* Current Memory Quote Heading */}
        <div className="caption-quote-wrapper">
          <p className="caption-quote-title">"{title}"</p>
        </div>

        {/* Manuscript Subheader */}
        <div className="manuscript-subheader">
          <span>{subHeader}</span>
        </div>

        {/* Preserved Poetic Manuscript Lines Area */}
        <div className="manuscript-lines-container">
          {messageLines.map((line, index) => {
            // Emphasize lines starting with Mahrooh, Husn-e-jaana, AFREEN, Usne jaana as shown in the reference
            const isEmphasized =
              line.toLowerCase().includes('mahrooh') ||
              line.toLowerCase().includes('husn-e-jaana') ||
              line.includes('AFREEN') ||
              line.toLowerCase().includes('usne jaana');

            const isMutedParens = line.startsWith('(') && line.endsWith(')');

            return (
              <p
                key={index}
                className={`manuscript-line ${isEmphasized ? 'line-emphasized' : ''} ${isMutedParens ? 'line-muted' : ''}`}
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>
    </section>
  );
};
