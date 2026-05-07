import { useState, useEffect, useRef } from 'react';

export default function Toast({ message, show, onHide, duration = 3000 }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (show) {
      timerRef.current = setTimeout(() => {
        onHide();
      }, duration);
    }
    return () => clearTimeout(timerRef.current);
  }, [show, duration, onHide]);

  return (
    <div className={`toast ${show ? 'show' : ''}`}>
      {message}
    </div>
  );
}
