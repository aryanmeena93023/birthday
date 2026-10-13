import React from 'react';
import './ArchiveFieldGuide.css';

interface FieldGuideItem {
  number: string;
  name: string;
}

const GUIDE_ITEMS: FieldGuideItem[] = [
  { number: '01', name: 'SEALED LETTER' },
  { number: '02', name: 'MEMORY BOX' },
  { number: '03', name: 'THE OWL' },
  { number: '04', name: 'RADIO AUDIO' },
  { number: '05', name: 'CIPHER BOX' },
  { number: '06', name: 'DESK DRAWER' },
];

/**
 * ArchiveFieldGuide
 * Informational sequence panel for Page 2 (The Archive Chamber).
 * Pure display element showing the sequence of recovered artifacts.
 */
export const ArchiveFieldGuide: React.FC = () => {
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
          <p className="archive-field-guide-subtitle">A SEQUENCE OF RECOVERED ARTIFACTS</p>

          <div className="archive-field-guide-divider" aria-hidden="true">
            <span className="archive-field-guide-divider-line" />
            <span className="archive-field-guide-divider-ornament" />
            <span className="archive-field-guide-divider-line" />
          </div>

          <ol className="archive-field-guide-list">
            {GUIDE_ITEMS.map((item) => (
              <li key={item.number} className="archive-field-guide-item">
                <span className="archive-field-guide-num">{item.number}</span>
                <span className="archive-field-guide-name">{item.name}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </aside>
  );
};

export default ArchiveFieldGuide;
