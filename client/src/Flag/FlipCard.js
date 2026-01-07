// src/flag/FlipCard.js
import React from 'react';

export default function FlipCard({
  frontText,
  backContent,
  flipped,
  onToggle,
  interactive = true,   // ← 追加：デフォルトtrue
}) {
  const handleClick = interactive ? onToggle : undefined;
  const onKeyDown = (e) => {
    if (!interactive) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      onToggle?.();
    }
  };

  return (
    <div
      className={`flip-card ${flipped ? 'is-flipped' : ''}`}
      onClick={handleClick}
      onKeyDown={onKeyDown}
      tabIndex={interactive ? 0 : -1}     // ← クリック不可時はフォーカス外す
      role="button"
      aria-pressed={!!flipped}
      aria-disabled={!interactive}         // ← アクセシビリティ
    >
      <div className="flip-card-inner">
        <div className="flip-card-face flip-card-front">
          <span className="flag-label">{frontText}</span>
        </div>
        <div className="flip-card-face flip-card-back">
          {typeof backContent === 'string'
            ? <span className="back-text">{backContent}</span>
            : backContent}
        </div>
      </div>
    </div>
  );
}
