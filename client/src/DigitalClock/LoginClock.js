// src/DigitalClock/LoginClock.js
import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import  "./LoginClock.css";

export default function LoginClock() {
    const [name, setName] = useState("");
    const [isComposing, setIsComposing] = useState(false); // IME変換中フラグ
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // ★追加：実行モードとグループ
    const [runType, setRunType] = useState(null); // "check" | "main"
    const [group, setGroup] = useState(null);         // "A" | "B"

    const trimmed = useMemo(() => name.trim(), [name]);
    
    const canGo = trimmed.length > 0 && !!runType && (runType !== "main" || !!group);

    const handleNext = () => {
        if (!canGo) return;

        navigate("/Clock", {
            state: {
                participant: trimmed,
                runType,                 // ★追加
                group: runType === "main" ? group : undefined, // ★check時はgroup無視でもOK
            },
        });
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
  <div className="login-wrap">
    <div className="start-card login-card">
      <div className="start-title">ログイン</div>
      <div className="start-desc">
        名前を入力して、実行モードを選んでください。
      </div>

      {/* 名前入力 */}
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

      {/* 実行モード */}
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

      {/* グループ（mainのみ） */}
      <div className={`login-panel ${runType === "main" ? "" : "is-disabled"}`}>
        <div className="login-panel-title">グループ（mainのみ）</div>

        <label className={`login-radio ${group === "A" ? "is-active" : ""}`}>
          <input
            type="radio"
            name="group"
            value="A"
            checked={group === "A"}
            onChange={() => setGroup("A")}
            disabled={runType !== "main"}
          />
          <div className="login-radio-text">
            <div className="login-radio-main">Group A</div>
            <div className="login-radio-sub">条件A</div>
          </div>
        </label>

        <label className={`login-radio ${group === "B" ? "is-active" : ""}`}>
          <input
            type="radio"
            name="group"
            value="B"
            checked={group === "B"}
            onChange={() => setGroup("B")}
            disabled={runType !== "main"}
          />
          <div className="login-radio-text">
            <div className="login-radio-main">Group B</div>
            <div className="login-radio-sub">条件B</div>
          </div>
        </label>
      </div>

      {/* 操作ボタン */}
      <div className="login-actions">
        <button
          className={`login-primary ${canGo ? "" : "is-disabled"}`}
          onClick={handleNext}
          disabled={!canGo}
        >
          進む
        </button>

        <button
          className="login-secondary"
          onClick={() => navigate("/PracticeClock")}
        >
          練習に戻る
        </button>
      </div>
    </div>
  </div>
);

}

