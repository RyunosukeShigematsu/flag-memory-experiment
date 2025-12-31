// QuestionSpeaker.js
import React, { useEffect, useRef, useState } from "react";
import { timeModeList } from "../timeLine";

export default function QuestionSpeaker({ speakTrigger }) {
  const indexRef = useRef(0);
  const startedRef = useRef(false);

  // ★ ブラウザの自動再生制限を回避するための「アンロック」状態
  const [unlocked, setUnlocked] = useState(false);

  // ★ voices が読み込まれたか（最初は空のことがある）
  const voicesReadyRef = useRef(false);

  // -------------------------
  // ① ユーザー操作でアンロック（見た目は何も出さない）
  // -------------------------
  useEffect(() => {
    const unlock = () => setUnlocked(true);

    // どれか1回でも操作があればOK（once）
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // -------------------------
  // ② voices の準備待ち
  // -------------------------
  useEffect(() => {
    const synth = window.speechSynthesis;

    const checkVoices = () => {
      const vs = synth.getVoices();
      if (vs && vs.length > 0) voicesReadyRef.current = true;
    };

    checkVoices(); // 初回チェック
    synth.onvoiceschanged = checkVoices; // 後から入る環境用

    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  // -------------------------
  // ③ 実際にしゃべる
  // -------------------------
  const speak = (text) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 1;

    synth.speak(u);
  };

  useEffect(() => {
    // 初期ロードは何もしない
    if (speakTrigger === 0) return;

    // ★ アンロック前は喋れない環境がある（リロード後に無音の主因）
    if (!unlocked) return;

    // ★ voices が空のままの瞬間があるので、準備できるまで待つ
    if (!voicesReadyRef.current) {
      // 少しだけ遅延して再試行（最小限の保険）
      const id = setTimeout(() => {
        // speakTrigger を変えずにもう一度同じ処理を走らせたいので、
        // ここでは「同じ質問をそのまま speak」する方式にする
        const item = timeModeList[indexRef.current];
        if (item?.question) speak(item.question);
      }, 200);

      return () => clearTimeout(id);
    }

    // 初回だけ indexRef をリセット
    if (!startedRef.current) {
      indexRef.current = 0;
      startedRef.current = true;
    }

    const item = timeModeList[indexRef.current];
    if (item?.question) speak(item.question);

    indexRef.current = (indexRef.current + 1) % timeModeList.length;
  }, [speakTrigger, unlocked]);

  return null;
}
