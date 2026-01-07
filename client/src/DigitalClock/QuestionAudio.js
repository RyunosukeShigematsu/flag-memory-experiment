import React, { useEffect, useRef, useState } from "react";

export default function QuestionAudio({ speakTrigger, unlockKey, text }) {
  const [unlocked, setUnlocked] = useState(false);

  const voicesReadyRef = useRef(false);
  const voiceJaRef = useRef(null);
  const speakingRef = useRef(false);

  // ★ 最新textを保持（depsから外すため）
  const latestTextRef = useRef("");
  useEffect(() => {
    latestTextRef.current = text || "";
  }, [text]);

  useEffect(() => {
    if (unlockKey > 0) setUnlocked(true);
  }, [unlockKey]);

  useEffect(() => {
    const synth = window.speechSynthesis;

    const pickJaVoice = () => {
      const vs = synth.getVoices() || [];
      if (vs.length > 0) voicesReadyRef.current = true;

      const ja =
        vs.find((v) => v.lang === "ja-JP" && /Kyoko/i.test(v.name)) ||
        vs.find((v) => v.lang === "ja-JP") ||
        vs.find((v) => /ja/i.test(v.lang));

      if (ja) voiceJaRef.current = ja;
    };

    pickJaVoice();
    synth.onvoiceschanged = pickJaVoice;
    return () => (synth.onvoiceschanged = null);
  }, []);

  const speak = (t) => {
    if (!t) return;
    const synth = window.speechSynthesis;

    if (speakingRef.current) return;

    const u = new SpeechSynthesisUtterance(t);
    u.lang = "ja-JP";
    if (voiceJaRef.current) u.voice = voiceJaRef.current;

    speakingRef.current = true;
    u.onend = () => (speakingRef.current = false);
    u.onerror = () => (speakingRef.current = false);

    synth.speak(u);
  };

  // ★ 発話は speakTrigger の変化だけで行う
  useEffect(() => {
    if (speakTrigger === 0) return;
    if (!unlocked) return;

    const t = latestTextRef.current;
    if (!t) return;

    if (!voicesReadyRef.current) {
      const id = setTimeout(() => speak(t), 300);
      return () => clearTimeout(id);
    }

    speak(t);
  }, [speakTrigger, unlocked]); // ★ text を外す

  return null;
}
