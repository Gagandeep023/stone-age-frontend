import React, { useEffect, useState } from 'react';

interface NotificationToastProps {
  message: string;
  type?: 'info' | 'error' | 'success';
  duration?: number;
  onDismiss?: () => void;
}

export function NotificationToast({
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
}: NotificationToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!visible || !message) return null;

  const colors = {
    info: { bg: 'rgba(212,160,23,0.2)', border: 'var(--sa-accent)', text: 'var(--sa-accent)' },
    error: { bg: 'rgba(204,68,68,0.15)', border: 'var(--sa-error)', text: 'var(--sa-error)' },
    success: { bg: 'rgba(68,170,68,0.15)', border: 'var(--sa-success)', text: 'var(--sa-success)' },
  };
  const c = colors[type];

  return (
    <div
      className="sa-toast sa-fade-in"
      style={{
        position: 'absolute',
        top: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '8px 20px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--sa-radius)',
        fontSize: 13,
        color: c.text,
        pointerEvents: 'auto',
        zIndex: 20,
        whiteSpace: 'nowrap',
      }}
    >
      {message}
    </div>
  );
}
