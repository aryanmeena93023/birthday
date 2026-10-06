/* DEV ONLY — REMOVE BEFORE PRODUCTION */
import React, { useEffect, useRef } from 'react';
import './DebugToast.css';

interface DebugToastProps {
  message: string | null;
  onDismiss: () => void;
}

const DebugToast: React.FC<DebugToastProps> = ({ message, onDismiss }) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (message) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onDismiss();
      }, 1800);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    /* DEV ONLY */
    <div className="debug-toast" aria-live="polite">
      <span className="debug-toast-label">HOTSPOT DETECTED</span>
      <span className="debug-toast-value">{message}</span>
    </div>
  );
};

export default DebugToast;
