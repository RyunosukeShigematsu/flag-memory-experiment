// src/FlagTask.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FlagTask.css';
import FlipCard from './FlipCard';
import COUNTRIES from './countries';
import { flagSequence } from '../timeLine'; // ← ★ 追加


export default function FlagTask() {
  const LIMIT_SECONDS = 10; // ← ここだけ変えればOK！
  const [timeLeft, setTimeLeft] = useState(LIMIT_SECONDS); // ← 制限時間（秒）をここで設定
  const navigate = useNavigate();
  const voiceRef = useRef(null);
  const askTimerRef = useRef(null);

  const TOTAL_TRIALS = 2;
  const { state } = useLocation();

  const trialIndex = state?.trialIndex ?? 0;

  // === 国旗リストをflagSequenceから取得 ===
  const ordered = useMemo(() => {
    const ids = flagSequence[trialIndex]; // [1,2,3,4,5,6,7,8,9]
    const map = new Map(COUNTRIES.map(c => [c.id, c]));
    return ids.map(id => map.get(id)).filter(Boolean);
  }, [trialIndex]);

  // プログレスバー用の割合計算（0〜100）
  const progress = (timeLeft / LIMIT_SECONDS) * 100;

  // 🕒 タイマー減少処理（0.1秒ずつ減るタイプ）
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timer);
          setTimeLeft(0); // ← まずバーを完全に0に
          // 0.3秒後に遷移（CSS反映の余裕を与える）
          setTimeout(() => {
            navigate('/flagAnswer', {
              state: {
                ids: ordered.map(c => c.id),
                autoSubmit: true,

                trialIndex,          // 今何回目か
                totalTrials: TOTAL_TRIALS, // 全体で何回か
              },
            });
          }, 300);
          return 0;
        }
        return +(prev - 0.1).toFixed(1);
      });
    }, 100);

    return () => clearInterval(timer);
  }, [navigate, ordered]);



  // ← 追加：左右の“開いているカード”のインデックス（0..8 or null）
  const [leftOpen, setLeftOpen] = useState(null);
  const [rightOpen, setRightOpen] = useState(null);

  // 左カードをクリック
  const handleLeftToggle = (i) => {
    setLeftOpen(prev => (prev === i ? null : i));
  };
  // 右カードをクリック
  const handleRightToggle = (i) => {
    setRightOpen(prev => (prev === i ? null : i));
  };

  return (
    <div className="card-task-container">

      <div className="trial-counter">
        {trialIndex + 1}/{TOTAL_TRIALS}
      </div>


      {/* 進行ゲージを上部に追加 */}
      <div className="progress-bar-wrapper">
        <div
          className="progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="task-message">国旗を覚えてください。</div>


      <div className="boards-area">
        {/* 左：国旗 */}
        <div className="board">
          {ordered.map((c, i) => {
            const flipped = leftOpen === i;
            return (
              <div
                key={`L-${c.id}-${i}`}
                className="select-tile hoverable"  // ← 常に hoverable を付与！
              >
                <FlipCard
                  flipped={flipped}
                  onToggle={() => handleLeftToggle(i)} // ← クリック処理はこれでOK
                  frontText="flag"
                  backContent={
                    <img
                      className="back-flag"
                      src={c.flag}
                      alt={c.nameJa}
                      decoding="async"
                      loading="lazy"
                    />
                  }
                />
              </div>
            );
          })}
        </div>

        {/* 右：名前 */}
        <div className="board">
          {ordered.map((c, i) => {
            const flipped = rightOpen === i;
            return (
              <div
                key={`R-${c.id}-${i}`}
                className="select-tile hoverable" // ← ここも常に hoverable
              >
                <FlipCard
                  flipped={flipped}
                  onToggle={() => handleRightToggle(i)}
                  frontText="name"
                  backContent={<span className="back-text">{c.nameJa}</span>}
                />
              </div>
            );
          })}
        </div>
      </div>


    </div>
  );
}