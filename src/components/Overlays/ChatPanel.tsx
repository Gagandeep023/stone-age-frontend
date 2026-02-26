import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../../types/index.js';

const EMOTES = [
  { id: 'thumbsUp', label: 'GG' },
  { id: 'thinking', label: 'Hmm' },
  { id: 'laugh', label: 'Ha!' },
  { id: 'gg', label: 'GG!' },
  { id: 'hurry', label: 'Go!' },
  { id: 'wow', label: 'Wow' },
];

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onSendEmote: (emote: string) => void;
}

export function ChatPanel({ messages, onSendMessage, onSendEmote }: ChatPanelProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim().slice(0, 100);
    if (trimmed) {
      onSendMessage(trimmed);
      setText('');
    }
  };

  return (
    <div
      className="sa-chat-panel"
      style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        width: collapsed ? 'auto' : 240,
        pointerEvents: 'auto',
        zIndex: 15,
      }}
    >
      {/* Toggle button */}
      <button
        className="sa-btn"
        style={{ fontSize: 12, padding: '4px 10px', marginBottom: collapsed ? 0 : 6 }}
        onClick={() => setCollapsed((c) => !c)}
      >
        Chat {!collapsed ? 'x' : messages.length > 0 ? `(${messages.length})` : ''}
      </button>

      {!collapsed && (
        <div style={{
          background: 'rgba(26,18,7,0.92)',
          border: '1px solid var(--sa-border)',
          borderRadius: 'var(--sa-radius)',
          overflow: 'hidden',
        }}>
          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              height: 140,
              overflowY: 'auto',
              padding: '8px 10px',
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            {messages.length === 0 && (
              <div style={{ color: 'var(--sa-text-muted)', textAlign: 'center', paddingTop: 40 }}>
                No messages yet
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                <span style={{ color: 'var(--sa-accent)', fontWeight: 600 }}>
                  {msg.playerName}:
                </span>{' '}
                <span style={{ color: 'var(--sa-text-primary)' }}>
                  {msg.emote || msg.message}
                </span>
              </div>
            ))}
          </div>

          {/* Emotes */}
          <div style={{
            display: 'flex',
            gap: 4,
            padding: '4px 8px',
            borderTop: '1px solid var(--sa-border)',
            flexWrap: 'wrap',
          }}>
            {EMOTES.map((e) => (
              <button
                key={e.id}
                className="sa-btn"
                style={{ fontSize: 10, padding: '2px 6px', minWidth: 0 }}
                onClick={() => onSendEmote(e.id)}
              >
                {e.label}
              </button>
            ))}
          </div>

          {/* Text input */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', padding: '4px 8px 8px' }}>
            <input
              className="sa-lobby-input"
              style={{ fontSize: 12, padding: '4px 8px', flex: 1 }}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type..."
              maxLength={100}
            />
            <button className="sa-btn sa-btn-primary" style={{ fontSize: 11, padding: '4px 8px', marginLeft: 4 }} type="submit">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
