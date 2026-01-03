// src/practiceFlagAnswer.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./FlagTask.css";
import FlipCard from "./FlipCard";
import COUNTRIES from "./countries";

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
    const [timeLeft, setTimeLeft] = useState(ANSWER_SECONDS);
    const progress = (timeLeft / ANSWER_SECONDS) * 100;

    const { state } = useLocation();
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState(null);

    const trialIndex = state?.trialIndex ?? 0;

    const base9 = useMemo(() => {
        if (!state?.ids || !Array.isArray(state.ids) || state.ids.length === 0) return null;
        const map = new Map(COUNTRIES.map((c) => [c.id, c]));
        const arr = state.ids.map((id) => map.get(+id)).filter(Boolean);
        return shuffle(arr);
    }, [state]);

    useEffect(() => {
        if (!base9) {
            navigate("/practiceFlagTask", { replace: true, state: { trialIndex: 0, started: false } });
        }
    }, [base9, navigate]);

    const left9 = useMemo(() => (base9 ? shuffle(base9) : []), [base9]);
    const right9 = useMemo(() => (base9 ? shuffle(base9) : []), [base9]);

    const bottom = useMemo(() => {
        if (!base9) return [];
        const selected = shuffle(base9).slice(0, 6);
        const names = selected.slice(0, 3);
        const flags = selected.slice(3, 6);
        return [...names.map((n) => ({ kind: "name", data: n })), ...flags.map((f) => ({ kind: "flag", data: f }))];
    }, [base9]);

    const [leftFlips, setLeftFlips] = useState(() => Array(9).fill(false));
    const [rightFlips, setRightFlips] = useState(() => Array(9).fill(false));
    useEffect(() => {
        if (left9.length) setLeftFlips(Array(left9.length).fill(false));
        if (right9.length) setRightFlips(Array(right9.length).fill(false));
    }, [left9, right9]);

    const [activeBottom, setActiveBottom] = useState(null);
    const [bottomResult, setBottomResult] = useState(Array(6).fill(null));
    const [bottomOpen, setBottomOpen] = useState(Array(6).fill(false));

    const handleBottomClick = (idx) => {
        if (bottomResult[idx] !== null) return;

        const item = bottom[idx];

        setBottomOpen((prev) =>
            prev.map((v, i) => (i === idx ? !v : bottomResult[i] ? true : false))
        );

        if (item.kind === "name") {
            setRightFlips(Array(right9.length).fill(false));
            setLeftFlips(Array(left9.length).fill(true));
        } else {
            setLeftFlips(Array(left9.length).fill(false));
            setRightFlips(Array(right9.length).fill(true));
        }

        setActiveBottom(idx);
    };

    const handleSelectTop = (side, indexOnSide) => {
        if (activeBottom == null || bottomResult[activeBottom] != null) return;

        const isLeftVisible = leftFlips.some((v) => v);
        const isRightVisible = rightFlips.some((v) => v);
        if (side === "left" && !isLeftVisible) return;
        if (side === "right" && !isRightVisible) return;

        const b = bottom[activeBottom];
        const targetId = b.data.id;
        const clickedId = side === "left" ? left9[indexOnSide].id : right9[indexOnSide].id;

        const correct =
            (b.kind === "name" && side === "left" && clickedId === targetId) ||
            (b.kind === "flag" && side === "right" && clickedId === targetId);

        setBottomResult((prev) => prev.map((v, i) => (i === activeBottom ? (correct ? "ok" : "ng") : v)));

        setFeedback(correct ? "ok" : "ng");
        setTimeout(() => setFeedback(null), 1000);

        const audio = new Audio(correct ? "/sounds/correct.mp3" : "/sounds/wrong.mp3");
        audio.volume = 0.3;
        audio.play();

        setActiveBottom(null);
    };

    // ✅ 無限ループ：次は必ず trialIndex+1 で Task へ戻る
    const goNext = useCallback(() => {
        navigate("/practiceFlagTask", {
            replace: true,
            state: {
                trialIndex: trialIndex + 1,
                started: true, // ★戻ったら開始ボタン無しで即開始
            },
        });
    }, [navigate, trialIndex]);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setTimeLeft((prev) => {
                const next = +(prev - 0.1).toFixed(1);
                return next <= 0 ? 0 : next;
            });
        }, 100);

        return () => window.clearInterval(timer);
    }, [trialIndex]);

    useEffect(() => {
        if (timeLeft > 0) return;

        const t = window.setTimeout(() => {
            goNext();
        }, 300);

        return () => window.clearTimeout(t);
    }, [timeLeft, goNext]);

    return (
        <div className="card-task-container">

            {/* ✅ 右上：練習終了（常に表示） */}
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

            <div className="top-slot">
                <div className="progress-wrapper">
                    <div className="progress-bar-track">
                        <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            <div className="task-message">対応する国旗を選択してください。</div>

            <div className="boards-area">
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
