// src/Finish.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Finish() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .finish-page {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
        }

        .finish-card {
          width: min(560px, calc(100vw - 32px));
          border: 1px solid rgba(0,0,0,0.10);
          border-radius: 18px;
          padding: 34px 28px 26px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
        }

        .finish-title {
          font-size: 34px;
          font-weight: 800;
          letter-spacing: 0.4px;
        }

        .finish-message {
          font-size: 17px;
          line-height: 1.6;
          opacity: 0.85;
        }

        .finish-buttons {
          display: flex;
          gap: 14px;
          margin-top: 14px;
        }

        .finish-btn {
          min-width: 160px;
          height: 44px;
          border-radius: 12px;
          border: none;
          background: rgba(0,0,0,0.90);
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>

      <div className="finish-page">
        <div className="finish-card">
          <div className="finish-title">終了です</div>

          <div className="finish-message">
            実験はすべて終了しました。<br />
            お疲れ様でした。
          </div>

          <div className="finish-buttons">
            <button
              className="finish-btn"
              onClick={() => navigate("/", { replace: true })}
            >
              ホーム画面へ
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
