import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Memories.css';
import { memories, type MemoryItem } from '../../content/memories';
import { playArtifactChime } from '../../utils/archiveAudio';
import { markDiscovered } from '../../utils/discoveryTracker';

const Memories: React.FC = () => {
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);

  useEffect(() => {
    markDiscovered('memories');
  }, []);

  const handleOpenViewer = (item: MemoryItem) => {
    playArtifactChime(523.25);
    setSelectedMemory(item);
  };

  const handleCloseViewer = useCallback(() => {
    playArtifactChime(349.23);
    setSelectedMemory(null);
  }, []);

  // Keyboard shortcut: close viewer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedMemory) {
        handleCloseViewer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMemory, handleCloseViewer]);

  const handleReturn = () => {
    playArtifactChime(392);
  };

  return (
    <main className={`memories-scene ${selectedMemory ? 'has-active-viewer' : ''}`}>
      <article className="memories-container">
        <header className="memories-header">
          <span className="memories-badge">RECOVERED DOSSIER // FILE-02</span>
          <h1 className="memories-title">MEMORY ARCHIVE</h1>
          <p className="memories-subtitle">A collection of recovered moments, preserved in time.</p>
        </header>

        {/* Exactly Two Memory Photograph Cards */}
        <section className="memories-grid" aria-label="Recovered Photographs">
          {memories.map((item, index) => (
            <div
              key={item.id}
              className={`memory-polaroid memory-polaroid-${(index % 2) + 1}`}
              onClick={() => handleOpenViewer(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenViewer(item);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`View full photograph of ${item.title}`}
            >
              <div className="memory-frame">
                <img
                  src={item.image}
                  alt={item.title}
                  className="memory-photo-img"
                  loading="lazy"
                />
                <div className="memory-photo-overlay-hint" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
                  </svg>
                </div>
              </div>

              <div className="memory-meta">
                <div className="memory-card-header">
                  <span className="memory-item-title">{item.title}</span>
                  <span className="memory-item-date">{item.date}</span>
                </div>
                <p className="memory-item-caption">"{item.caption}"</p>
                {item.details && (
                  <p className="memory-item-details">{item.details}</p>
                )}
              </div>
            </div>
          ))}
        </section>

        <div className="memories-return-container">
          <Link to="/case" onClick={handleReturn} className="memories-return-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            <span>RETURN TO ARCHIVE</span>
          </Link>
        </div>
      </article>

      {/* Cinematic Full-Photo Memory Viewer Overlay */}
      {selectedMemory && (
        <div
          className="memory-viewer-backdrop"
          onClick={handleCloseViewer}
          role="dialog"
          aria-modal="true"
          aria-labelledby="viewer-title"
        >
          <div
            className="memory-viewer-frame"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="memory-viewer-close-btn"
              onClick={handleCloseViewer}
              aria-label="Close photo viewer"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>

            <div className="memory-viewer-image-container">
              <img
                src={selectedMemory.image}
                alt={selectedMemory.title}
                className="memory-viewer-img"
              />
            </div>

            <div className="memory-viewer-meta">
              <div className="memory-viewer-header">
                <h2 id="viewer-title" className="memory-viewer-title">{selectedMemory.title}</h2>
                <span className="memory-viewer-date">{selectedMemory.date}</span>
              </div>
              <p className="memory-viewer-caption">"{selectedMemory.caption}"</p>
              {selectedMemory.details && (
                <p className="memory-viewer-details">{selectedMemory.details}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Memories;

