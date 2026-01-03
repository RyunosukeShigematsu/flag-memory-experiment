// src/practiceFlagTask.js
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./FlagTask.css";
import FlipCard from "./FlipCard";
import COUNTRIES from "./countries";
import { flagSequence } from "../timeLine";

export default function PracticeFlagTask() {
    const MEMORIZE_SECONDS = 5;
    const [timeLeft, setTimeLeft] = useState(MEMORIZE_SECONDS);

    const navigate = useNavigate();
    const { state } = useLocation();

    // 練習は trialIndex だけ（無限ループ）
    const trialIndex = state?.trialIndex ?? 0;

    // 2周目以降は started:true で戻す想定
    const startedFromState = state?.started === true;
    const [started, setStarted] = useState(startedFromState);

    // 左右の“開いているカード”（あなたの挙動を維持）
    const [leftOpen, setLeftOpen] = useState(null);
    const [rightOpen, setRightOpen] = useState(null);

    const handleLeftToggle = (i) => setLeftOpen((prev) => (prev === i ? null : i));
    const handleRightToggle = (i) => setRightOpen((prev) => (prev === i ? null : i));

    // === 国旗リスト（flagSequenceを無限に回す）===
    const ordered = useMemo(() => {
        const seqLen = flagSequence?.length ?? 0;
        if (!seqLen) return [];

        const ids = flagSequence[trialIndex % seqLen];
        const map = new Map(COUNTRIES.map((c) => [c.id, c]));
        return ids.map((id) => map.get(id)).filter(Boolean);
    }, [trialIndex]);

    const progress = (timeLeft / MEMORIZE_SECONDS) * 100;

    // trialIndex が変わったら、（戻りなら）即開始＆状態リセット
    useEffect(() => {
        if (startedFromState) {
            setStarted(true);
            setTimeLeft(MEMORIZE_SECONDS);
            setLeftOpen(null);
            setRightOpen(null);
        } else {
            // 初回だけStartボタンを出したいならここは何もしないでOK
            // setStarted(false); ← stateで明示しない限り初期falseにならないので不要
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trialIndex]);

    // タイマー減少（0.1秒刻み）
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

    // 0になったらAnswerへ（練習用にpracticeへ）
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
            {/* ✅ 右上：練習終了（常に表示） */}
            {started && (
                <button
                    className="practice-exit-btn"
                    type="button"
                    onClick={() =>
                        navigate("/flagTask", {
                            replace: true,
                            state: { started: false },
                        })
                    }
                >
                    練習終了
                </button>
            )}


            {/* 上部：開始 or プログレスバー */}
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
                {/* 左：国旗 */}
                <div className="board">
                    {ordered.map((c, i) => {
                        const flipped = leftOpen === i;
                        return (
                            <div key={`L-${c.id}-${i}`} className="select-tile hoverable">
                                <FlipCard
                                    flipped={flipped}
                                    onToggle={started ? () => handleLeftToggle(i) : undefined}
                                    frontText="flag"
                                    backContent={
                                        <img className="back-flag" src={c.flag} alt={c.nameJa} decoding="async" loading="lazy" />
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
                            <div key={`R-${c.id}-${i}`} className="select-tile hoverable">
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
