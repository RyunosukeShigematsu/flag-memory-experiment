// src/DigitalClock/LoginClock.js
import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
        <div style={styles.wrap}>
            <h2 style={styles.title}>名前を入力</h2>

            <input
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                placeholder="例：重松龍之介"
                style={styles.input}
            />

            {/* ★追加：実行モード */}
            <div style={styles.panel}>
                <div style={styles.panelTitle}>実行モード</div>
                <label style={styles.radioRow}>
                    <input
                        type="radio"
                        name="runType"
                        value="check"
                        checked={runType === "check"}
                        onChange={() => setRunType("check")}
                    />
                    <span>check（確認）</span>
                </label>

                <label style={styles.radioRow}>
                    <input
                        type="radio"
                        name="runType"
                        value="main"
                        checked={runType === "main"}
                        onChange={() => setRunType("main")}
                    />
                    <span>main（本番）</span>
                </label>
            </div>

            {/* ★追加：グループ（mainの時だけ有効） */}
            <div style={{ ...styles.panel, opacity: runType === "main" ? 1 : 0.45 }}>
                <div style={styles.panelTitle}>グループ（mainのみ）</div>
                <label style={styles.radioRow}>
                    <input
                        type="radio"
                        name="group"
                        value="A"
                        checked={group === "A"}
                        onChange={() => setGroup("A")}
                        disabled={runType !== "main"}
                    />
                    <span>Group A</span>
                </label>

                <label style={styles.radioRow}>
                    <input
                        type="radio"
                        name="group"
                        value="B"
                        checked={group === "B"}
                        onChange={() => setGroup("B")}
                        disabled={runType !== "main"}
                    />
                    <span>Group B</span>
                </label>
            </div>

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

            <button
                onClick={() => navigate("/PracticeClock")}
                style={styles.practiceButton}
            >
                練習に戻る
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
    practiceButton: {
        width: 320,
        padding: "10px 14px",
        fontSize: 15,
        color: "#111827",              // 黒寄り
        backgroundColor: "#e5e7eb",    // 薄いグレー
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
    },

};
