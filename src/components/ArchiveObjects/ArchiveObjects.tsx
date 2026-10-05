import React from 'react';
import './ArchiveObjects.css';
import Envelope from './Envelope';
import MemoryArchive from './MemoryArchive';
import AudioEvidence from './AudioEvidence';
import Raven from './Raven';
import LockedDrawer from './LockedDrawer';
import ForbiddenBox from './ForbiddenBox';

const ArchiveObjects: React.FC = () => {
  return (
    <div className="interactive-objects-layer">
      <Envelope />
      <MemoryArchive />
      <AudioEvidence />
      <Raven />
      <LockedDrawer />
      <ForbiddenBox />
    </div>
  );
};

export default ArchiveObjects;
