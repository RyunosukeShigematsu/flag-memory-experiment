// src/Finish.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FlagTask.css';

export default function Finish() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const total = state?.totalTrials ?? 9;

  return (
    <div className="card-task-container" style={{ display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 12 }}>終了！</div>
        <div style={{ fontSize: 18, marginBottom: 24 }}>
          {total} 回のタスクが完了しました
        </div>

        <button
          className="go-answer-btn"
          onClick={() => navigate('/flagTask', { replace: true, state: { trialIndex: 0, totalTrials: total } })}
        >
          もう一度
        </button>
      </div>
    </div>
  );
}
