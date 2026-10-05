import React from 'react';

const Envelope: React.FC = () => {
  return (
    <div className="archive-envelope-wrapper">
      <img
        src="/media/archive/envelope.png"
        alt="Case Envelope"
        className="archive-envelope-asset"
        draggable={false}
      />
    </div>
  );
};

export default Envelope;
