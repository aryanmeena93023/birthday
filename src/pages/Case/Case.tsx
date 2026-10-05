import React from 'react';
import './Case.css';
import ArchiveObjects from '../../components/ArchiveObjects/ArchiveObjects';

const Case: React.FC = () => {
  return (
    <div className="case-page">
      {/* Background Layer */}
      <img
        src="/media/archive/archive-room.webp"
        alt="Archive Room Background"
        className="archive-bg-img"
      />
      
      {/* Typography Layer */}
      <div className="archive-typography-overlay">
        <h1 className="archive-title">THE ARCHIVE</h1>
        <div className="archive-subtitle">CASE FILE: KHUSHI</div>
        <p className="archive-caption">Explore the recovered artifacts.</p>
      </div>

      {/* Interactive Objects Layer */}
      <ArchiveObjects />
    </div>
  );
};

export default Case;



