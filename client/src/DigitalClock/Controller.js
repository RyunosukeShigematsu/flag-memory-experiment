// Controller.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { systemCheckTimeModeList, timeModeList_A, timeModeList_B } from "../timeLine";
import Clock from "./Clock";
import QuestionAudio from "./QuestionAudio";
import "./Controller.css";
import createAudioCapture from "./AudioCapture";
import { useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import createSpeechCapture from "./SpeechCapture";



// const SHOW_DURATION = 3000;
// const HIDE_DURATION = 22000;
// const ASK_DELAY = 5000;
// const BEEP_LEAD = 500; // 時計表示の0.5秒前に鳴らす
// const END_DELAY = 15_000;        // ★ 追加：最後の質問後〜終了まで

const SHOW_DURATION = 2000;   // 1.5 秒
const HIDE_DURATION = 8000;   // 8.0 秒
const ASK_DELAY = 3000;       // 1.5 秒
const BEEP_LEAD = 500;        // 0.3 秒
const END_DELAY = 15000;        // ★ 追加：最後の質問後〜終了まで



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
  const [timeString, setTimeString] = useState("--:--:--");
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState(0);
  const [speakTrigger, setSpeakTrigger] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [unlockKey, setUnlockKey] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");

  const audioCapRef = useRef(null);
  const speechCapRef = useRef(null);

  const indexRef = useRef(0);
  const trialCountRef = useRef(0);
  const tickRef = useRef(null);
  const prevVisibleRef = useRef(visible);

  const endTimerIdRef = useRef(null);     // setTimeout のIDを持つ
  const endLockedRef = useRef(false);     // 終了処理の二重実行防止

  const beepTimerRef = useRef(null);
  const showTimerRef = useRef(null);
  const askTimerRef = useRef(null);

  const location = useLocation();
  const participant = location.state?.participant || "anon";

  const navigate = useNavigate();

  //セット管理
  const TOTAL_SETS = 2;          // ←ここを変えればセット数変わる
  const [setNo, setSetNo] = useState(1); // 1始まり
  const [allDone, setAllDone] = useState(false);

  // ★ Login から渡される値（無ければデフォルト）
  const runType = location.state?.runType ?? "check"; // "check" | "main"
  const group = location.state?.group ?? "A";         // "A" | "B"（check時は実質無視）

  // ★ 今が何セット目かで、使う配列を決める
  const activeTimeModeList = useMemo(() => {
    // check は常に systemCheck
    if (runType !== "main") return systemCheckTimeModeList;

    // main：GroupA は A→B→A→B…、GroupB は B→A→B→A…
    const first = group === "A" ? timeModeList_A : timeModeList_B;
    const second = group === "A" ? timeModeList_B : timeModeList_A;

    // setNo は 1始まり：奇数セット=first、偶数セット=second
    return (setNo % 2 === 1) ? first : second;
  }, [runType, group, setNo]);

  // ★ check → "check", mainは A/B
  const runLabel = useMemo(() => {
    return runType !== "main" ? "check" : (group === "A" ? "A" : "B");
  }, [runType, group]);


  const TOTAL_TRIALS = activeTimeModeList.length;



  // ★追加：setNo の最新値を setTimeout 内でも使えるようにする
  const setNoRef = useRef(1);

  useEffect(() => {
    setNoRef.current = setNo;
  }, [setNo]);



  // =============================
  // ③ AudioCapture インスタンス作成
  // =============================
  useEffect(() => {
    if (!audioCapRef.current) {
      audioCapRef.current = createAudioCapture({
        timesliceMs: 10_000,
        uploadUrl: "https://shigematsu.nkmr.io/m1_project/api/upload_audio.php", // ★AudioCapture側で持たせる
      });
    }
  }, []);

  // =============================
  // ③ SpeechCapture インスタンス作成
  // =============================
  useEffect(() => {
    if (!speechCapRef.current) {
      speechCapRef.current = createSpeechCapture({
        uploadUrl: "https://shigematsu.nkmr.io/m1_project/api/upload_text.php",
        autoDownloadOnUploadFail: true,
      });
    }
  }, []);


  // =============================
  // ③ アンマウント時の掃除（推奨）
  // =============================
  useEffect(() => {
    return () => {
      try {
        clearTimeout(beepTimerRef.current);
        clearTimeout(showTimerRef.current);
        clearTimeout(askTimerRef.current);
        clearTimeout(endTimerIdRef.current);
        clearInterval(tickRef.current);
      } catch (_) { }
      try {
        audioCapRef.current?.forceStop?.();
      } catch (_) { }
    };
  }, []);

  // =============================
  // ④ リセット
  // =============================
  const resetRun = async () => {
    clearTimeout(beepTimerRef.current);
    clearTimeout(showTimerRef.current);
    clearTimeout(askTimerRef.current);
    clearTimeout(endTimerIdRef.current);
    clearInterval(tickRef.current);
    endLockedRef.current = false;
    endTimerIdRef.current = null;


    // 録音が残ってたら止める（安全優先）
    try {
      await audioCapRef.current?.forceStop?.();
      console.log("[REC] force stopped");
    } catch (e) {
      console.warn("[REC] forceStop failed:", e);
    }


    // 音声認識が残ってたら止める（安全優先）
    try {
      await speechCapRef.current?.forceStop?.();
      console.log("[STT] force stopped");
    } catch (e) {
      console.warn("[STT] forceStop failed:", e);
    }


    indexRef.current = 0;
    trialCountRef.current = 0;
    prevVisibleRef.current = false;

    setSpeakTrigger(0);
    setVisible(false);
    setFinished(false);
    setTimeString("--:--:--");
    setCurrentQuestion("");
    setMode(0);
  };


  // =============================
  // ① 表示 / 非表示サイクル
  //    + trial 開始時に timeLine を参照
  // =============================
  useEffect(() => {
    if (!started) return;

    let timerId;

    if (visible) {
      // ---- trial 開始 ----
      const item = activeTimeModeList[indexRef.current];
      if (item) {
        setTimeString(item.time); // ← timeLine から取得
        setMode(item.mode);
        setCurrentQuestion(item.question ?? "");

        // ★ 質問を timeline に追加（que）
        speechCapRef.current?.pushTimeline?.({
          type: "que",
          text: item.question ?? "",
          trialIndex: trialCountRef.current + 1, // この trial の番号（1始まり）
          mode: item.mode,
          time: item.time,
        });


      }

      // ★このtrialを使ったので、次のtrialへ進める
      indexRef.current += 1;
      // ★追加：このtrialを1個消費した
      trialCountRef.current += 1;

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

      // ★追加：次のtrialが無いなら、ビープも表示も予約しない
      if (indexRef.current >= TOTAL_TRIALS) {
        clearTimeout(timerId); // ★追加（念のため）
        clearTimeout(beepTimerRef.current);
        clearTimeout(showTimerRef.current);
        clearInterval(tickRef.current);

        return () => {
          clearTimeout(timerId);
          clearTimeout(beepTimerRef.current);
          clearTimeout(showTimerRef.current);
          clearInterval(tickRef.current);
        };
      }



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
  }, [visible, started, activeTimeModeList, TOTAL_TRIALS]);


  // =============================
  // ② 非表示後に質問音声
  // =============================
  useEffect(() => {
    if (!started) return;

    const wasVisible = prevVisibleRef.current;
    const isVisible = visible;

    // 時計表示が終わった瞬間
    if (wasVisible && !isVisible) {
      clearTimeout(askTimerRef.current); // ★追加：二重予約防止
      askTimerRef.current = setTimeout(() => {
        setSpeakTrigger(t => t + 1);

        // ★追加：最後の質問を読んだ（= speakTrigger を増やした）後に終了予約
        if (trialCountRef.current === TOTAL_TRIALS && !endLockedRef.current) {
          endLockedRef.current = true; // ★ここで即ロック
          // ★終了が確定した瞬間に、残ってる予約を全部消す
          clearTimeout(beepTimerRef.current);
          clearTimeout(showTimerRef.current);
          clearTimeout(askTimerRef.current);
          clearInterval(tickRef.current);

          // 念のため今後の表示も止める
          setVisible(false);
          endTimerIdRef.current = setTimeout(async () => {
            // ★この終了が「最終セットか」を先に確定（アップロード成否に依存させない）
            const isLastSet = setNoRef.current >= TOTAL_SETS;

            try {
              setFinished(true);
              setStarted(false);
              setVisible(false);

              // アップロードは失敗してもOK（allDoneは別で立てる）
              const result = await audioCapRef.current.finishSession();
              console.log("[REC] uploaded:", result);

              // ★ここにSTTを入れる！！
              try {
                const stt = await speechCapRef.current.finishSession();
                console.log("[STT] finish:", stt);
              } catch (e) {
                console.warn("[STT] finish failed:", e);
              }


              console.log("[REC] isRecording after finish:", audioCapRef.current?.isRecording?.());
            } catch (e) {
              console.warn("[REC] upload failed:", e);
            } finally {
              // ★ここで必ず allDone を反映
              if (isLastSet) setAllDone(true);

              endTimerIdRef.current = null;
            }
          }, END_DELAY);


        }

      }, ASK_DELAY);

      prevVisibleRef.current = isVisible;
      return () => clearTimeout(askTimerRef.current);
    }

    // 状態更新
    prevVisibleRef.current = isVisible;
  }, [visible, started, setNo, TOTAL_SETS, TOTAL_TRIALS]);



  // =============================
  // ⑤ 描画（時計）と音声（質問）
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
        {!started && !allDone && setNo === 1 && !finished && (
          <button
            className="controller-start-button"
            onClick={async () => {
              // 1セット目固定
              setNoRef.current = 1;
              if (setNo !== 1) setSetNo(1);

              setAllDone(false);
              await resetRun();
              setUnlockKey((k) => k + 1);

              try {
                await audioCapRef.current.beginSession({
                  prefix: "session",
                  extra: { participant, set: 1, runLabel },
                });
                console.log("[REC] started");
              } catch (e) {
                console.warn("[REC] start failed:", e);
                return;
              }

              // ★ここを追加：1セット目のSTT開始
              try {
                await speechCapRef.current.beginSession({
                  participant,
                  set: 1,
                  runLabel,
                  // ★ audio と揃えるため
                  filenameBaseExtra: {
                    participant,
                    set: 1,
                    runLabel,
                  },
                });

                console.log("[STT] started");
              } catch (e) {
                console.warn("[STT] start failed (ok):", e);
              }


              setStarted(true);
            }}

          >
            開始
          </button>

        )}

        <QuestionAudio
          speakTrigger={speakTrigger}
          unlockKey={unlockKey}
          text={currentQuestion}
        />
      </div>

      {finished &&
        createPortal(
          <div className="set-toast">
            <span>{setNo}セット目終了しました</span>

            {setNo >= TOTAL_SETS ? (
              <button className="toast-btn" onClick={() => navigate("/")}>
                ホーム画面へ
              </button>
            ) : (
              <button
                className="toast-btn"
                onClick={async () => {
                  const next = setNo + 1;
                  setNoRef.current = next;
                  setSetNo(next);

                  setAllDone(false);
                  await resetRun();
                  setUnlockKey((k) => k + 1);

                  try {
                    await audioCapRef.current.beginSession({
                      prefix: "session",
                      extra: { participant, set: next, runLabel },
                    });
                  } catch (e) {
                    console.warn("[REC] start failed:", e);
                    return;
                  }

                  try {
                    await speechCapRef.current.beginSession({
                      participant,
                      set: next,
                      runLabel,
                      // ★ audio と揃えるため
                      filenameBaseExtra: {
                        participant,
                        set: next,
                        runLabel,
                      },
                    });

                  } catch (e) {
                    console.warn("[STT] start failed (ok):", e);
                  }

                  setStarted(true);
                }}
              >
                次のセットへ
              </button>
            )}
          </div>,
          document.body
        )
      }


    </div>
  );
}

