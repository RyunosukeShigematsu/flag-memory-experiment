import React, { useEffect, useRef, useState } from "react";
import { practiceTimeModeList } from "../timeLine";
import Clock from "./Clock";
import QuestionAudio from "./QuestionAudio";
import "./Controller.css";
import { useNavigate } from "react-router-dom";

const SHOW_DURATION = 2000;
const HIDE_DURATION = 8000;
const ASK_DELAY = 3000;
const BEEP_LEAD = 500;

// HH:MM:SS を 1 秒進める
function addOneSecond(timeStr) {
    if (!timeStr?.includes(":")) return timeStr;
    const [h, m, s] = timeStr.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, s + 1);
    return [
        String(d.getHours()).padStart(2, "0"),
        String(d.getMinutes()).padStart(2, "0"),
        String(d.getSeconds()).padStart(2, "0"),
    ].join(":");
}

// ビープ
let audioCtx;
async function playBeep() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            await audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.value = 1000;
        gain.gain.value = 0.05;

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
        console.warn("playBeep failed:", e);
    }
}

export default function PracticeClock() {
    const navigate = useNavigate();

    const [timeString, setTimeString] = useState("--:--:--");
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState(0);
    const [speakTrigger, setSpeakTrigger] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [started, setStarted] = useState(false);


    const indexRef = useRef(0);
    const tickRef = useRef(null);
    const prevVisibleRef = useRef(false);

    const beepTimerRef = useRef(null);
    const showTimerRef = useRef(null);
    const askTimerRef = useRef(null);

    const TOTAL_TRIALS = practiceTimeModeList.length;
    const [unlockKey, setUnlockKey] = useState(0);


    // リセット（録音なし版）
    const resetPractice = () => {
        clearTimeout(beepTimerRef.current);
        clearTimeout(showTimerRef.current);
        clearTimeout(askTimerRef.current);
        clearInterval(tickRef.current);

        indexRef.current = 0;
        prevVisibleRef.current = false;

        setSpeakTrigger(0);
        setVisible(false);
        setTimeString("--:--:--");
        setCurrentQuestion("");
        setMode(0);
    };

    // アンマウント掃除
    useEffect(() => {
        return () => {
            clearTimeout(beepTimerRef.current);
            clearTimeout(showTimerRef.current);
            clearTimeout(askTimerRef.current);
            clearInterval(tickRef.current);
        };
    }, []);

    // 表示/非表示サイクル（無限ループ）
    useEffect(() => {
        if (!started) return;

        let timerId;

        if (visible) {
            // ---- trial 開始 ----
            const item = practiceTimeModeList[indexRef.current];
            if (item) {
                setTimeString(item.time);
                setMode(item.mode);
                setCurrentQuestion(item.question ?? "");
            }

            // 次へ（最後まで行ったら 0 に戻す）
            indexRef.current = (indexRef.current + 1) % TOTAL_TRIALS;

            // 表示中だけ 1 秒進める
            clearInterval(tickRef.current);
            tickRef.current = setInterval(() => {
                setTimeString((prev) => addOneSecond(prev));
            }, 1000);

            timerId = setTimeout(() => {
                clearInterval(tickRef.current);
                setVisible(false);
            }, SHOW_DURATION);
        } else {
            // ---- 非表示 ----
            const waitBeforeBeep = Math.max(0, HIDE_DURATION - BEEP_LEAD);

            beepTimerRef.current = setTimeout(() => {
                playBeep();
                showTimerRef.current = setTimeout(() => {
                    setVisible(true);
                }, BEEP_LEAD);
            }, waitBeforeBeep);

            return () => {
                clearTimeout(beepTimerRef.current);
                clearTimeout(showTimerRef.current);
                clearInterval(tickRef.current);
            };
        }

        return () => {
            clearTimeout(timerId);
            clearInterval(tickRef.current);
        };
    }, [visible, started, TOTAL_TRIALS]);

    // 非表示直後に質問音声（Controllerと同じ判定）
    useEffect(() => {
        if (!started) return;

        const wasVisible = prevVisibleRef.current;
        const isVisible = visible;

        if (wasVisible && !isVisible) {
            clearTimeout(askTimerRef.current);
            askTimerRef.current = setTimeout(() => {
                setSpeakTrigger((t) => t + 1);
            }, ASK_DELAY);

            prevVisibleRef.current = isVisible;
            return () => clearTimeout(askTimerRef.current);
        }

        prevVisibleRef.current = isVisible;
    }, [visible, started]);

    return (
        <div className="common-layout">
            <div className="practice-badge">
                練習中
            </div>
            <div className="clock-wrapper">
                <div className="clock-area">
                    <Clock timeString={timeString} mode={mode} visible={visible} />
                </div>

                {/* Controllerと同じ：開始ボタン（押したら started=true） */}
                {!started && (
                    <button
                        className="controller-start-button"
                        onClick={() => {
                            resetPractice();
                            setUnlockKey((k) => k + 1);
                            setStarted(true);
                        }}
                    >
                        練習開始
                    </button>
                )}

                <QuestionAudio speakTrigger={speakTrigger} unlockKey={unlockKey} text={currentQuestion} />
            </div>

            {started && (
                <button
                    className="practice-exit-btn"
                    onClick={() => navigate("/LoginClock")}
                >
                    練習終了
                </button>
            )}
        </div>
    );
}
