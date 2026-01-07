import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Consent.css";

export default function Consent() {
  const navigate = useNavigate();

  const CONSENT_ITEMS = useMemo(
    () => [
      { id: "c1", text: "本実験は、画面に表示される情報に基づく簡単な課題を行います。" },
      { id: "c2", text: "実験中は、指示が出たらできるだけ落ち着いて操作してください。" },
    //   { id: "c3", text: "途中で気分が悪くなった場合は、いつでも中止して構いません。" },
    //   { id: "c4", text: "取得したデータは研究目的のみに使用し、個人が特定されない形で扱います。" },
    //   { id: "c5", text: "内容を理解した上で、同意して次に進みます。" },
    ],
    []
  );

  const [consent, setConsent] = useState(() =>
    Object.fromEntries(CONSENT_ITEMS.map((it) => [it.id, false]))
  );

  const allChecked = useMemo(
    () => CONSENT_ITEMS.every((it) => consent[it.id]),
    [CONSENT_ITEMS, consent]
  );

  const toggleConsent = (id) => {
    setConsent((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="consent-wrap">
      <div className="start-card consent-card">
        <div className="start-title">実験の説明</div>
        <div className="start-desc">
          以下を確認してチェックしてください。すべてチェックすると次へ進めます。
        </div>

        <div className="consent-list">
          {CONSENT_ITEMS.map((it) => (
            <label
              key={it.id}
              className={`consent-item ${consent[it.id] ? "is-checked" : ""}`}
            >
              <input
                type="checkbox"
                checked={!!consent[it.id]}
                onChange={() => toggleConsent(it.id)}
              />
              <span className="consent-text">{it.text}</span>
            </label>
          ))}
        </div>

        <div className={`consent-status ${allChecked ? "ok" : ""}`}>
          {allChecked ? "✅ すべてチェック済み" : "⬜ まだ未チェックがあります"}
        </div>

        <div className="consent-actions">
          <button
            className={`consent-primary ${allChecked ? "" : "is-disabled"}`}
            disabled={!allChecked}
            onClick={() => navigate("/practiceFlagTask")}
          >
            同意してログインへ
          </button>

          <button
            className="consent-secondary"
            onClick={() => navigate("/")}
          >
            ホーム画面に戻る
          </button>
        </div>
      </div>
    </div>
  );
}
