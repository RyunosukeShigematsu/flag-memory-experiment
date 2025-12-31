// Controller.js
import React, { useEffect, useRef, useState } from "react";
import { timeModeList } from "../timeLine";
import Clock from "./Clock";
import QuestionAudio from "./QuestionAudio";
import "./Controller.css";

const SHOW_DURATION = 3000;
const HIDE_DURATION = 22000;
const ASK_DELAY = 5000;
const BEEP_LEAD = 500; // 時計表示の0.5秒前に鳴らす



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


//ビープ音を鳴らす関数
let audioCtx;

async function playBeep() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // ★ ここが重要：止まってたら起こす
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


export default function TaskController() {
  // =============================
  // 状態管理
  // =============================
  const [timeString, setTimeString] = useState("--:--:--"); // ← 最初はダミー
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState(0);
  const [speakTrigger, setSpeakTrigger] = useState(0);

  const indexRef = useRef(0);
  const tickRef = useRef(null);

  const [started, setStarted] = useState(false);

  // ② 非表示後に質問音声（visible が true→false になった瞬間だけ）
  const prevVisibleRef = useRef(visible);

  // =============================
  // ① 表示 / 非表示サイクル
  //    + trial 開始時に timeLine を参照
  // =============================
  useEffect(() => {
    if (!started) return;

    let timerId;

    if (visible) {
      // ---- trial 開始 ----
      const item = timeModeList[indexRef.current];
      if (item) {
        setTimeString(item.time); // ← timeLine から取得
        setMode(item.mode);
      }

      // ★このtrialを使ったので、次のtrialへ進める
      indexRef.current = (indexRef.current + 1) % timeModeList.length;

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

  let beepTimerId = null;
  let showTimerId = null;

  beepTimerId = setTimeout(() => {
    playBeep(); // ★ 表示0.5秒前の「ピ」

    showTimerId = setTimeout(() => {
      setVisible(true); // ★ 時計表示開始
    }, BEEP_LEAD);
  }, waitBeforeBeep);

  return () => {
    clearTimeout(beepTimerId);
    clearTimeout(showTimerId);
    clearInterval(tickRef.current);
  };
    }

    return () => {
      clearTimeout(timerId);
      clearInterval(tickRef.current);
    };
  }, [visible, started]);

  // =============================
  // ② 非表示後に質問音声
  // =============================
  useEffect(() => {
    if (!started) return;

    const wasVisible = prevVisibleRef.current;
    const isVisible = visible;

    // 時計表示が終わった瞬間
    if (wasVisible && !isVisible) {
      const id = setTimeout(() => {
        setSpeakTrigger((t) => t + 1);
      }, ASK_DELAY);

      prevVisibleRef.current = isVisible;
      return () => clearTimeout(id);
    }

    // 状態更新
    prevVisibleRef.current = isVisible;
  }, [visible, started]);


  // =============================
  // ③ 描画（時計）と音声（質問）
  // =============================
  return (
    <div className="common-layout">
      <div className="clock-wrapper">
        <div className="clock-area">
          <Clock
            timeString={timeString}
            mode={mode}
            visible={visible}
          />
        </div>

        {/* ★ 時計の真下に開始ボタン */}
        {!started && (
          <button
            className="controller-start-button"
            onClick={() => {
              setStarted(true);
              // setVisible(true);
            }}
          >
            開始
          </button>
        )}

        <QuestionAudio speakTrigger={speakTrigger} />
      </div>
    </div>
  );
}
