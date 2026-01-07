// src/practiceFlagAnswer.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./FlagTask.css";
import FlipCard from "./FlipCard";
import PRACTICE_COUNTRIES from './countriesReal';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PracticeFlagAnswer() {
  const ANSWER_SECONDS = 5;

  const { state } = useLocation();
  const navigate = useNavigate();

  const trialIndex = state?.trialIndex ?? 0;

  // ===== UI state =====
  const [timeLeft, setTimeLeft] = useState(ANSWER_SECONDS);
  const progress = (timeLeft / ANSWER_SECONDS) * 100;

  const [feedback, setFeedback] = useState(null); // null | 'ok' | 'ng'

  // ===== このtrialで使う配列を「確定して固定」するstate =====
  const [base9, setBase9] = useState(null); // 9個（Taskから渡されたids順）
  const [left9, setLeft9] = useState([]);   // 表示用にシャッフルした9
  const [right9, setRight9] = useState([]); // 表示用にシャッフルした9
  const [bottom, setBottom] = useState([]); // 下段6（9から抽選して固定）

  // ===== flip/answer state =====
  const [leftFlips, setLeftFlips] = useState(Array(9).fill(false));
  const [rightFlips, setRightFlips] = useState(Array(9).fill(false));

  const [activeBottom, setActiveBottom] = useState(null);
  const [bottomResult, setBottomResult] = useState(Array(6).fill(null)); // null | 'ok' | 'ng'
  const [bottomOpen, setBottomOpen] = useState(Array(6).fill(false));

  // ===== 1) state.ids を受け取って、このtrialの内容を確定 =====
  useEffect(() => {
    const ids = state?.ids;

    // ids がない/壊れてるときはTaskへ戻す
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      navigate("/practiceFlagTask", { replace: true, state: { trialIndex: 0, started: false } });
      return;
    }

    // ids -> country object
    const map = new Map(PRACTICE_COUNTRIES.map((c) => [c.id, c]));
    const b9 = ids.map((id) => map.get(+id)).filter(Boolean);

    if (b9.length !== ids.length) {
      // どれか見つからない（id不一致）なら安全のため戻す
      navigate("/practiceFlagTask", { replace: true, state: { trialIndex: 0, started: false } });
      return;
    }

    // base9確定
    setBase9(b9);

    // 左右はシャッフルして固定
    const l9 = shuffle(b9);
    const r9 = shuffle(b9);
    setLeft9(l9);
    setRight9(r9);

    // 下段6は「9から6抽選」して固定
    const selected = shuffle(b9).slice(0, 6);
    const names = selected.slice(0, 3);
    const flags = selected.slice(3, 6);

    setBottom([
      ...names.map((n) => ({ kind: "name", data: n })),
      ...flags.map((f) => ({ kind: "flag", data: f })),
    ]);

    // trial切り替え時にUI/回答状態をリセット
    setTimeLeft(ANSWER_SECONDS);
    setFeedback(null);

    setLeftFlips(Array(l9.length).fill(false));
    setRightFlips(Array(r9.length).fill(false));

    setActiveBottom(null);
    setBottomResult(Array(6).fill(null));
    setBottomOpen(Array(6).fill(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialIndex, state?.ids, navigate]);

  // ===== 2) 下段をクリックして、対応する盤面を開く =====
  const handleBottomClick = (idx) => {
    if (!bottom?.length) return;
    if (bottomResult[idx] !== null) return;

    const item = bottom[idx];


    // ✅ いまの状態から「このクリック後に open になるか」を判断
    const willOpen = !bottomOpen[idx];

    // クリックしたところだけトグル（他は閉じる）
    setBottomOpen((prev) =>
      prev.map((v, i) => (i === idx ? !v : bottomResult[i] ? true : false))
    );

    if (willOpen) {
      // ✅ open のときだけ、対応する上段9枚を開く
      // nameを選んだら「右の盤面（名前）」を閉じて、左（旗）を開く
      if (item.kind === "name") {
        setRightFlips(Array(right9.length).fill(false));
        setLeftFlips(Array(left9.length).fill(true));
      } else {
        setLeftFlips(Array(left9.length).fill(false));
        setRightFlips(Array(right9.length).fill(true));
      }

      setActiveBottom(idx);
    } else {
      // ✅ close したら、上段も両方ぜんぶ閉じる（ここが今回の目的）
      setLeftFlips(Array(left9.length).fill(false));
      setRightFlips(Array(right9.length).fill(false));
      setActiveBottom(null);
    }

  };

  // ===== 3) 上段（左/右）を押して判定する =====
  const handleSelectTop = (side, indexOnSide) => {
    if (!bottom?.length) return;
    if (activeBottom == null || bottomResult[activeBottom] != null) return;

    const isLeftVisible = leftFlips.some((v) => v);
    const isRightVisible = rightFlips.some((v) => v);
    if (side === "left" && !isLeftVisible) return;
    if (side === "right" && !isRightVisible) return;

    const b = bottom[activeBottom];
    const targetId = b.data.id;

    const clickedId =
      side === "left" ? left9[indexOnSide]?.id : right9[indexOnSide]?.id;

    if (clickedId == null) return;

    const correct =
      (b.kind === "name" && side === "left" && clickedId === targetId) ||
      (b.kind === "flag" && side === "right" && clickedId === targetId);

    setBottomResult((prev) =>
      prev.map((v, i) => (i === activeBottom ? (correct ? "ok" : "ng") : v))
    );

    setFeedback(correct ? "ok" : "ng");
    window.setTimeout(() => setFeedback(null), 1000);

    try {
      const audio = new Audio(correct ? "/sounds/correct.mp3" : "/sounds/wrong.mp3");
      audio.volume = 0.3;
      audio.play();
    } catch {
      // 音声が無くても進行できるように黙って無視
    }

    setActiveBottom(null);
  };

  // ===== 4) タイマー =====
  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        const next = +(prev - 0.1).toFixed(1);
        return next <= 0 ? 0 : next;
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, [trialIndex]);

  // ===== 5) 0秒になったら次trialへ戻す =====
  const goNext = useCallback(() => {
    navigate("/practiceFlagTask", {
      replace: true,
      state: {
        trialIndex: trialIndex + 1,
        started: true, // 戻ったら即開始
      },
    });
  }, [navigate, trialIndex]);

  useEffect(() => {
    if (timeLeft > 0) return;

    const t = window.setTimeout(() => {
      goNext();
    }, 300);

    return () => window.clearTimeout(t);
  }, [timeLeft, goNext]);

  return (
    <div className="card-task-container">
      <div className="practice-badge">練習中</div>

      {/* 右上：練習終了 */}
      <button
        className="practice-exit-btn"
        type="button"
        onClick={() => navigate("/flagLogin", { replace: true, state: { started: false } })}
      >
        練習終了
      </button>

      <div className="top-slot">
        <div className="progress-wrapper">
          <div className="progress-bar-track">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="task-message">対応する国旗を選択してください。</div>

      <div className="boards-area">
        {/* 左：国旗 */}
        <div className="board">
          {left9.map((c, i) => {
            const flipped = leftFlips[i];
            const canHover = flipped;
            return (
              <div
                key={`AL-${c.id}-${i}`}
                className={`select-tile ${canHover ? "hoverable" : ""}`}
                onClick={() => handleSelectTop("left", i)}
              >
                <FlipCard
                  interactive={false}
                  flipped={flipped}
                  frontText="flag"
                  backContent={<img className="back-flag" src={c.flag} alt={c.nameJa} />}
                />
              </div>
            );
          })}
        </div>

        {/* 右：名前 */}
        <div className="board">
          {right9.map((c, i) => {
            const flipped = rightFlips[i];
            const canHover = flipped;
            return (
              <div
                key={`AR-${c.id}-${i}`}
                className={`select-tile ${canHover ? "hoverable" : ""}`}
                onClick={() => handleSelectTop("right", i)}
              >
                <FlipCard
                  interactive={false}
                  flipped={flipped}
                  frontText="name"
                  backContent={<span className="back-text">{c.nameJa}</span>}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 下段6 */}
      <div className="answer-bottom">
        {bottom.map((item, idx) => {
          const result = bottomResult[idx];
          const slotClass =
            "answer-slot" + (result === "ok" ? " is-correct" : result === "ng" ? " is-wrong" : "");

          return (
            <div className={slotClass} key={`B-${idx}`}>
              <FlipCard
                flipped={bottomOpen[idx]}
                onToggle={() => handleBottomClick(idx)}
                frontText={item.kind === "name" ? "name" : "flag"}
                backContent={
                  item.kind === "name" ? (
                    <span className="back-text">{item.data.nameJa}</span>
                  ) : (
                    <img className="back-flag" src={item.data.flag} alt={item.data.nameJa} />
                  )
                }
              />
            </div>
          );
        })}
      </div>

      {feedback && (
        <div className={`judge-overlay ${feedback === "ok" ? "ok" : "ng"}`}>
          {feedback === "ok" ? "○" : "×"}
        </div>
      )}
    </div>
  );
}
