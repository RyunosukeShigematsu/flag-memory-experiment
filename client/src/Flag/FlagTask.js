// src/FlagTask.js
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FlagTask.css';
import FlipCard from './FlipCard';
import COUNTRIES from './countries';
import { flagSequence, flagSequence_A, flagSequence_B } from '../timeLine'; // ← ★ 追加
import { cap } from "./flagCapSingleton"; // パスは実際の場所に合わせて


export default function FlagTask() {
  const MEMORIZE_SECONDS = 5; // ← ここだけ変えればOK！
  const [timeLeft, setTimeLeft] = useState(MEMORIZE_SECONDS); // ← 制限時間（秒）をここで設定  

  const navigate = useNavigate();
  const { state } = useLocation();

  const abortOnly = (reason = "unknown") => {
    if (cap.isActive?.()) cap.abortSet(reason);
  };

  const setIndex = state?.setIndex ?? 0;     // 0始まり
  const totalSets = state?.totalSets ?? 2;
  const trialIndex = state?.trialIndex ?? 0;

  const runType = state?.runType ?? "check";
  const activeSeq = useMemo(() => {
    if (runType === "check") return flagSequence;
    return setIndex % 2 === 0 ? flagSequence_A : flagSequence_B;
  }, [runType, setIndex]);

  const TOTAL_TRIALS = activeSeq.length;

  const memStartLoggedRef = useRef(new Set());

  // ★追加：started初期値を state から拾う
  const startedFromState = state?.started === true;
  const [started, setStarted] = useState(startedFromState);

  // === 国旗リストをflagSequenceから取得 ===
  // const ordered = useMemo(() => {
  // const ids = flagSequence[trialIndex]; // [1,2,3,4,5,6,7,8,9]
  const ordered = useMemo(() => {
    const spec = activeSeq[trialIndex];
    const ids = spec?.ids ?? [];
    const map = new Map(COUNTRIES.map(c => [c.id, c]));
    return ids.map(id => map.get(id)).filter(Boolean);
  }, [trialIndex, activeSeq]);

  // プログレスバー用の割合計算（0〜100）
  const progress = (timeLeft / MEMORIZE_SECONDS) * 100;

  useEffect(() => {
    const onBeforeUnload = () => {
      // リロード/タブ閉じ/URL直打ち etc.
      abortOnly("window_unload_flagtask");
      // ※ここで await cap.saveSet() は基本できない（ブラウザが待ってくれない）
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    // 2回目以降（started:trueで戻ってくる想定）はStart不要
    if (state?.started === true) {
      setStarted(true);
      setTimeLeft(MEMORIZE_SECONDS); // 戻ってきたらリセットして即開始
      setLeftOpen(null);
      setRightOpen(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialIndex]);


  useEffect(() => {
    if (!started) return;

    // 1 trial につき1回だけ
    const key = `${setIndex}-${trialIndex}`;
    if (memStartLoggedRef.current.has(key)) return;
    memStartLoggedRef.current.add(key);

    cap.log("MEM_START", {
      trialIndex, // 0-based
      payload: {
        memorizeSeconds: MEMORIZE_SECONDS,
      },
    });
  }, [started, setIndex, trialIndex, MEMORIZE_SECONDS]);


  // 🕒 タイマー減少処理（0.1秒ずつ減るタイプ）
  useEffect(() => {
    if (!started) return;

    const timer = window.setInterval(() => {
      setTimeLeft(prev => {
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
      navigate('/flagAnswer', {
        state: {
          ids: ordered.map(c => c.id),
          bottomL: activeSeq[trialIndex]?.bottomL,
          bottomR: activeSeq[trialIndex]?.bottomR,
          autoSubmit: true,
          trialIndex,
          totalTrials: TOTAL_TRIALS,
          setIndex,
          totalSets,
          started: true,
          runType,
        },
      });
    }, 300);

    return () => window.clearTimeout(t);
  }, [started, timeLeft, navigate, ordered, trialIndex, TOTAL_TRIALS, setIndex, totalSets]);



  // ← 追加：左右の“開いているカード”のインデックス（0..8 or null）
  const [leftOpen, setLeftOpen] = useState(null);
  const [rightOpen, setRightOpen] = useState(null);

  // 左カードをクリック
  const handleLeftToggle = (i) => {
    if (!started) return;

    const c = ordered[i];
    if (!c) return;

    const wasOpen = leftOpen === i;
    const action = wasOpen ? "close" : "open";

    if (cap.isActive?.()) {
      cap.log("CARD_TOGGLE", {
        trialIndex,
        payload: {
          phase: "mem",
          side: "flag",
          cardId: c.id,
          action,
        },
      });
    }

    setLeftOpen(prev => (prev === i ? null : i));
  };

  // 右カードをクリック
  const handleRightToggle = (i) => {
    if (!started) return;

    const c = ordered[i];
    if (!c) return;

    const wasOpen = rightOpen === i;
    const action = wasOpen ? "close" : "open";

    if (cap.isActive?.()) {
      cap.log("CARD_TOGGLE", {
        trialIndex,
        payload: {
          phase: "mem",
          side: "name",
          cardId: c.id,
          action,
        },
      });
    }

    setRightOpen(prev => (prev === i ? null : i));
  };

  return (
    <div className="card-task-container">

      {/* 本実験の時は消す */}
      <div className="trial-counter">
        {trialIndex + 1}/{TOTAL_TRIALS}
      </div>

      {/* ★ 上部UIの共通置き場（位置だけ担当） */}
      <div className="top-slot">
        {!started ? (
          <div className="start-card">

            <div className="start-desc">
              準備ができたら、実験者に声をかけてから開始してください。
            </div>

            {/* セット情報（必要なら表示） */}
            <div className="start-meta">
              セット {setIndex + 1} / {totalSets} ・ 1セット {TOTAL_TRIALS} 試行
            </div>

            <button
              className="start-btn"
              onClick={() => {
                // ★追加：セット開始を宣言（ファイル名の核が決まる）
                cap.beginSet({ setIndex });

                // ★ここ追加：trialごとのMEM_START重複防止ガードをセット開始時に初期化
                memStartLoggedRef.current = new Set();

                // ★開始ボタン押下ログ（このセットで1回だけ）
                cap.log("SET_START", {
                  // trialIndexは付けない方針でOK（まだtrial開始してない）
                  payload: {
                    totalTrials: TOTAL_TRIALS,
                    memorizeSeconds: MEMORIZE_SECONDS,
                  },
                });

                setLeftOpen(null);
                setRightOpen(null);
                setTimeLeft(MEMORIZE_SECONDS);
                setStarted(true);
              }}
            >
              開始
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


      {started && (
        <div className="task-message">
          国旗を覚えてください。
        </div>
      )}

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
                  onToggle={started ? () => handleLeftToggle(i) : undefined}
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
                  onToggle={started ? () => handleRightToggle(i) : undefined}
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