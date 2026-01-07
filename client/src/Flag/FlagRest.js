// src/FlagRest.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function FlagRest() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // 受け取る想定（なければデフォルト）
  const restSeconds = Number.isFinite(state?.restSeconds) ? state.restSeconds : 5;
  const nextSetIndex = Number.isFinite(state?.nextSetIndex) ? state.nextSetIndex : 0; // 0-based
  const totalSets = Number.isFinite(state?.totalSets) ? state.totalSets : 1;
  const totalTrials = Number.isFinite(state?.totalTrials) ? state.totalTrials : 1;

  const initial = Math.max(0, restSeconds);
  const [timeLeft, setTimeLeft] = useState(initial);
  const done = timeLeft <= 0;

  const runType = state?.runType ?? "check";
  // StrictMode対策：interval多重起動防止
  const intervalRef = useRef(null);

  useEffect(() => {
    if (initial <= 0) return;
    if (intervalRef.current) return;

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 0.1;
        return next <= 0 ? 0 : +next.toFixed(1);
      });
    }, 100);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [initial]);

  const labelSec = useMemo(() => Math.ceil(timeLeft), [timeLeft]);

  const goNextSet = () => {
    navigate("/flagTask", {
      replace: true,
      state: {
        setIndex: nextSetIndex,
        totalSets,
        trialIndex: 0,
        totalTrials,
        started: false, // 次セットはStartを出す
        runType,
      },
    });
  };

  return (
    <>
      {/* ▼ このファイル内にCSSを埋め込む */}
      <style>{`
        .rest-page {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
        }

        .rest-card {
          width: min(560px, calc(100vw - 32px));
          border: 1px solid rgba(0,0,0,0.10);
          border-radius: 18px;
          padding: 28px 26px 22px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px; /* ← これで重なりが起きない */
        }

        .rest-title {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 0.4px;
          margin: 2px 0 0;
        }

        .rest-timer {
          font-size: 20px;
          font-weight: 700;
          opacity: 0.9;
        }

        .rest-desc {
          font-size: 15px;
          line-height: 1.6;
          text-align: center;
          opacity: 0.78;
          margin-top: 4px;
        }

        .rest-button {
          width: 240px;
          height: 46px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.14);
          background: #ffffff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        .rest-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .rest-button.ready {
          border: none;
          background: rgba(0,0,0,0.90);
          color: #fff;
        }

        .rest-mini {
          margin-top: 2px;
          font-size: 12px;
          opacity: 0.55;
          text-align: center;
        }
      `}</style>

      <div className="rest-page">
        <div className="rest-card">
          <div className="rest-title">休憩です</div>

          <div className="rest-timer">（{labelSec}秒）</div>

          <div className="rest-desc">
            休憩が終わったら「次のセットへ」を押してください
          </div>

          <button
            className={`rest-button ${done ? "ready" : ""}`}
            onClick={goNextSet}
            disabled={!done}
          >
            次のセットへ
          </button>

        </div>
      </div>
    </>
  );
}
