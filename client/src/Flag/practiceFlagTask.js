// src/practiceFlagTask.js
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./FlagTask.css";
import FlipCard from "./FlipCard";
import PRACTICE_COUNTRIES from './countriesReal';

function pickRandom(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

export default function PracticeFlagTask() {
  const MEMORIZE_SECONDS = 5;
  const [timeLeft, setTimeLeft] = useState(MEMORIZE_SECONDS);

  const navigate = useNavigate();
  const { state } = useLocation();

  const trialIndex = state?.trialIndex ?? 0;
  const startedFromState = state?.started === true;
  const [started, setStarted] = useState(startedFromState);

  const [leftOpen, setLeftOpen] = useState(null);
  const [rightOpen, setRightOpen] = useState(null);

  const handleLeftToggle = (i) => setLeftOpen((prev) => (prev === i ? null : i));
  const handleRightToggle = (i) => setRightOpen((prev) => (prev === i ? null : i));

  const [pickedIds, setPickedIds] = useState([]);

  // trialIndex が変わるたびに 27→9 を抽選して固定
  useEffect(() => {
    const ids = pickRandom(PRACTICE_COUNTRIES, 9).map((c) => c.id);
    setPickedIds(ids);

    if (startedFromState) {
      setStarted(true);
      setTimeLeft(MEMORIZE_SECONDS);
      setLeftOpen(null);
      setRightOpen(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialIndex]);

  const ordered = useMemo(() => {
    if (!pickedIds.length) return [];
    const map = new Map(PRACTICE_COUNTRIES.map((c) => [c.id, c]));
    return pickedIds.map((id) => map.get(id)).filter(Boolean);
  }, [pickedIds]);

  const progress = (timeLeft / MEMORIZE_SECONDS) * 100;

  useEffect(() => {
    if (!started) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        const next = +(prev - 0.1).toFixed(1);
        return next <= 0 ? 0 : next;
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, [started, trialIndex]);

  useEffect(() => {
    if (!started) return;
    if (timeLeft > 0) return;

    const t = window.setTimeout(() => {
      navigate("/practiceFlagAnswer", {
        state: {
          ids: ordered.map((c) => c.id),
          trialIndex,
        },
      });
    }, 300);

    return () => window.clearTimeout(t);
  }, [started, timeLeft, navigate, ordered, trialIndex]);

  return (
    <div className="card-task-container">
      <div className="practice-badge">練習中</div>

      {started && (
        <button
          className="practice-exit-btn"
          type="button"
          onClick={() => navigate("/flagLogin", { replace: true, state: { started: false } })}
        >
          練習終了
        </button>
      )}

      <div className="top-slot">
        {!started ? (
          <div className="start-card">
            <div className="start-desc">準備ができたら開始してください。</div>
            <button
              className="start-btn"
              onClick={() => {
                setLeftOpen(null);
                setRightOpen(null);
                setTimeLeft(MEMORIZE_SECONDS);
                setStarted(true);
              }}
            >
              練習開始
            </button>
          </div>
        ) : (
          <div className="progress-wrapper">
            <div className="progress-bar-track">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {started && <div className="task-message">国旗を覚えてください。</div>}

      <div className="boards-area">
        <div className="board">
          {ordered.map((c, i) => (
            <div key={`L-${c.id}-${i}`} className="select-tile hoverable">
              <FlipCard
                flipped={leftOpen === i}
                onToggle={started ? () => handleLeftToggle(i) : undefined}
                frontText="flag"
                backContent={<img className="back-flag" src={c.flag} alt={c.nameJa} decoding="async" loading="lazy" />}
              />
            </div>
          ))}
        </div>

        <div className="board">
          {ordered.map((c, i) => (
            <div key={`R-${c.id}-${i}`} className="select-tile hoverable">
              <FlipCard
                flipped={rightOpen === i}
                onToggle={started ? () => handleRightToggle(i) : undefined}
                frontText="name"
                backContent={<span className="back-text">{c.nameJa}</span>}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
