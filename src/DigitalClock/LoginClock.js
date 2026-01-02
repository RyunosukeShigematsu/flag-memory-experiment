// src/DigitalClock/LoginClock.js
import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginClock() {
  const [name, setName] = useState("");
  const [isComposing, setIsComposing] = useState(false); // IME変換中フラグ
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const trimmed = useMemo(() => name.trim(), [name]);
  const canGo = trimmed.length > 0;

  const handleNext = () => {
    if (!canGo) return;
    navigate("/Clock", { state: { participant: trimmed } });    
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // 日本語IME変換中のEnterは何もしない（確定はIMEに任せる）
      if (isComposing || e.nativeEvent.isComposing) return;

      // 変換していないEnterは「確定」扱いでフォーカスを外すだけ
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  return (
    <div style={styles.wrap}>
      <h2 style={styles.title}>名前を入力</h2>

      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        placeholder="例：P001 など"
        style={styles.input}
      />

      <button
        onClick={handleNext}
        disabled={!canGo}
        style={{
          ...styles.button,
          backgroundColor: canGo ? "#16a34a" : "#9ca3af", // 緑 / グレー
          cursor: canGo ? "pointer" : "not-allowed",
        }}
      >
        進む
      </button>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    padding: 24,
  },
  title: {
    margin: 0,
    fontSize: 24,
  },
  input: {
    width: 320,
    padding: "12px 14px",
    fontSize: 16,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    outline: "none",
    boxSizing: "border-box",
  },
  button: {
    width: 320,
    padding: "12px 14px",
    fontSize: 16,
    color: "white",
    border: "none",
    borderRadius: 10,
  },
};
