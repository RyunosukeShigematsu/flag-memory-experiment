// src/DigitalClock/LoginClock.js
import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FlagLogin.css";

export default function FlagLogin() {
  const [name, setName] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const [runType, setRunType] = useState(null); // "check" | "main"

  const trimmed = useMemo(() => name.trim(), [name]);
  const canGo = trimmed.length > 0 && !!runType;


  const handleNext = () => {
    if (!canGo) return;
    navigate("/FlagTask", {
      state: {
        participant: trimmed,
        runType,
      },
    });

  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    if (isComposing || e.nativeEvent.isComposing) return;
    e.preventDefault();
    inputRef.current?.blur();
  };

  return (
    <div className="login-wrap">
      <div className="start-card login-card">
        <div className="start-title">ログイン</div>
        <div className="start-desc">名前を入力して、実行モードを選んでください。</div>

        <div className="login-field">
          <div className="login-label">参加者名</div>
          <input
            ref={inputRef}
            className="login-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="例：重松龍之介"
          />
        </div>

        <div className="login-panel">
          <div className="login-panel-title">実行モード</div>

          <label className={`login-radio ${runType === "check" ? "is-active" : ""}`}>
            <input
              type="radio"
              name="runType"
              value="check"
              checked={runType === "check"}
              onChange={() => setRunType("check")}
            />
            <div className="login-radio-text">
              <div className="login-radio-main">check</div>
              <div className="login-radio-sub">確認（テスト実行）</div>
            </div>
          </label>

          <label className={`login-radio ${runType === "main" ? "is-active" : ""}`}>
            <input
              type="radio"
              name="runType"
              value="main"
              checked={runType === "main"}
              onChange={() => setRunType("main")}
            />
            <div className="login-radio-text">
              <div className="login-radio-main">main</div>
              <div className="login-radio-sub">本番（参加者実験）</div>
            </div>
          </label>
        </div>

        <div className="login-actions">
          <button
            className={`login-primary ${canGo ? "" : "is-disabled"}`}
            onClick={handleNext}
            disabled={!canGo}
          >
            進む
          </button>

          <button className="login-secondary" onClick={() => navigate("/PracticeFlagTask")}>
            練習に戻る
          </button>
        </div>
      </div>
    </div>
  );
}
