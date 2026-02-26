import React, { useEffect, useState } from 'react';
import { useAssetPath, assetUrl } from '../../utils/assetPath.js';

interface CardDetailOverlayProps {
  type: 'card' | 'building';
  index: number;
  onClose: () => void;
}

export function CardDetailOverlay({ type, index, onClose }: CardDetailOverlayProps) {
  const basePath = useAssetPath();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const imagePath = type === 'card'
    ? `cards/civilization-card-${index}.jpg`
    : `huts/building-hut-${index}.jpg`;

  const title = type === 'card'
    ? `Civilization Card ${index}`
    : `Building Tile ${index}`;

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: visible ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0)',
        transition: 'background 0.2s ease',
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: visible ? 'scale(1)' : 'scale(0.8)',
          opacity: visible ? 1 : 0,
          transition: 'all 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <img
          src={assetUrl(basePath, imagePath)}
          alt={title}
          style={{
            maxWidth: 320,
            maxHeight: '70vh',
            borderRadius: 8,
            border: '3px solid #7a5a30',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            objectFit: 'contain',
          }}
          draggable={false}
        />
        <div style={{
          color: '#f0e6d2',
          fontSize: 14,
          fontWeight: 600,
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
        }}>
          {title}
        </div>
        <div style={{
          color: '#b8a88a',
          fontSize: 12,
        }}>
          Click anywhere to close
        </div>
      </div>
    </div>
  );
}
