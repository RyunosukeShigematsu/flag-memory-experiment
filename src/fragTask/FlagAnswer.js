// --- 既存importそのまま ---
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FlagTask.css';
import FlipCard from './FlipCard';
import COUNTRIES from './countries';


function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlagAnswer() {
  const LIMIT_SECONDS = 10;
  const [timeLeft, setTimeLeft] = useState(LIMIT_SECONDS);
  const progress = (timeLeft / LIMIT_SECONDS) * 100;
  const { state } = useLocation();
  const navigate = useNavigate();
  // ○×のフィードバック表示用（null | 'ok' | 'ng'）
  const [feedback, setFeedback] = useState(null);

  const trialIndex = state?.trialIndex ?? 0;
  const totalTrials = state?.totalTrials; // ← FlagTaskが渡してくる前提

  // 受け取り
  const base9 = useMemo(() => {
    if (!state?.ids || !Array.isArray(state.ids) || state.ids.length === 0) return null;
    const map = new Map(COUNTRIES.map(c => [c.id, c]));
    const arr = state.ids.map(id => map.get(+id)).filter(Boolean);
    return shuffle(arr)
  }, [state]);
  useEffect(() => {
    if (!base9) navigate('/flagTask', { replace: true });
  }, [base9, navigate]);

  // 上段配置（左右は同じ9種だが並びは独立にシャッフル）
  const left9 = useMemo(() => (base9 ? shuffle(base9) : []), [base9]);  // 左=flag
  const right9 = useMemo(() => (base9 ? shuffle(base9) : []), [base9]);  // 右=name

  // 下段4枚（左2=name / 右2=flag）
  const bottom = useMemo(() => {
    if (!base9) return [];
    // 9枚の中からランダムに6枚選ぶ
    const selected = shuffle(base9).slice(0, 6);
    // 左右に3枚ずつ分割（重複なし）
    const names = selected.slice(0, 3);
    const flags = selected.slice(3, 6);

    return [
      ...names.map(n => ({ kind: 'name', data: n })),
      ...flags.map(f => ({ kind: 'flag', data: f })),
    ];
  }, [base9]);

  // 上段は「表裏の状態」（初期=裏）
  const [leftFlips, setLeftFlips] = useState(() => Array(9).fill(false));
  const [rightFlips, setRightFlips] = useState(() => Array(9).fill(false));
  useEffect(() => {
    if (left9.length) setLeftFlips(Array(left9.length).fill(false));
    if (right9.length) setRightFlips(Array(right9.length).fill(false));
  }, [left9, right9]);


  // 下段：現在選択中のカード／判定結果（'ok' | 'ng' | null）
  const [activeBottom, setActiveBottom] = useState(null);              // 0..3 or null
  // const [bottomOpen, setBottomOpen]     = useState(null);              // 視覚反転用
  // const [bottomResult, setBottomResult] = useState([null, null, null, null]);
  const [bottomResult, setBottomResult] = useState(Array(6).fill(null));
  // ✅ 最初にすべて「裏」の状態で初期化
  // const [bottomOpen, setBottomOpen] = useState([false, false, false, false]);
  const [bottomOpen, setBottomOpen] = useState(Array(6).fill(false));


  // 下段クリック：押した側=表 / 反対側=裏（あなたの前回仕様のまま）
  // かつ、まだ未判定のときだけ「この下段カードをアクティブ」にする
  const handleBottomClick = (idx) => {
    //判定済み（ok/ng）のカードは何もしない
    if (bottomResult[idx] !== null) return;

    const item = bottom[idx];

    // 下段の見た目反転（任意）
    // setBottomOpen(prev => (prev === idx ? null : idx));
    setBottomOpen(prev =>
      prev.map((v, i) =>
        i === idx
          ? !v
          : bottomResult[i] ? true : false
      )
    );


    // 盤の可視状態切替（前回仕様）
    if (item.kind === 'name') {
      setRightFlips(Array(right9.length).fill(false));
      setLeftFlips(Array(left9.length).fill(true));
    } else if (item.kind === 'flag') {
      setLeftFlips(Array(left9.length).fill(false));
      setRightFlips(Array(right9.length).fill(true));
    }

    // まだ判定していないカードだけ、上段選択の受付を開始
    setActiveBottom(prev => (bottomResult[idx] == null ? idx : prev));
  };

  // 上段クリックで選択（めくらずに“選ぶ”だけ）
  const handleSelectTop = (side, indexOnSide) => {
    if (activeBottom == null || bottomResult[activeBottom] != null) return;

    // ✅ 左右の盤の可視状態に応じてクリックを無効化
    const isLeftVisible = leftFlips.some(v => v);
    const isRightVisible = rightFlips.some(v => v);
    if (side === 'left' && !isLeftVisible) return;  // 左が閉じているとき無視
    if (side === 'right' && !isRightVisible) return; // 右が閉じているとき無視

    const b = bottom[activeBottom]; // { kind, data }
    const targetId = b.data.id;     // 下段に表示している国のID

    const clickedId =
      side === 'left' ? left9[indexOnSide].id : right9[indexOnSide].id;

    // 正解条件：
    // - 下段が name → 上段は left(flag) で同じ国id
    // - 下段が flag → 上段は right(name) で同じ国id
    const correct =
      (b.kind === 'name' && side === 'left' && clickedId === targetId) ||
      (b.kind === 'flag' && side === 'right' && clickedId === targetId);

    setBottomResult(prev =>
      prev.map((v, i) => (i === activeBottom ? (correct ? 'ok' : 'ng') : v))
    );

    // ✅ フィードバック表示（中央に○または×）
    setFeedback(correct ? 'ok' : 'ng');
    setTimeout(() => setFeedback(null), 1000); // 1秒後に消える

    // ✅ 効果音を鳴らす
    const audio = new Audio(correct ? '/sounds/correct.mp3' : '/sounds/wrong.mp3');
    audio.volume = 0.3; // 音量(0.0〜1.0)
    audio.play();

    // 一回きりで終了
    setActiveBottom(null);
  };


  // ✅ 次へ：trialIndex を +1、最後なら finish へ
  const goNext = () => {
    const nextIndex = trialIndex + 1;

    if (nextIndex >= totalTrials) {
      navigate('/finish', { replace: true, state: { totalTrials } });
      return;
    }

    // FlagTask側でTOTAL_TRIALSを保持してるが、表示のために毎回渡すのが安全
    navigate('/flagTask', {
      replace: true,
      state: { trialIndex: nextIndex, totalTrials },
    });
  };


  //カウントダウンタイマー
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timer);
          setTimeLeft(0);
          setTimeout(() => {
            goNext();
          }, 300);
          return 0;
        }
        return +(prev - 0.1).toFixed(1);
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);


  return (

    <div className="card-task-container">
      <div className="trial-counter">
        {trialIndex + 1}/{totalTrials}
      </div>
      <div className="progress-bar-wrapper">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="task-message">対応する国旗を選択してください。</div>

      {/* 上段：クリックで“選択”だけ受付（FlipCard自体は非インタラクティブのまま） */}
      <div className="boards-area">

        {/* 左：flag 面 */}
        <div className="board">
          {left9.map((c, i) => {
            const flipped = leftFlips[i];  // ← 表か裏か
            const canHover = flipped;      // ← 表のときだけ hoverable
            return (
              <div
                key={`AL-${c.id}-${i}`}
                className={`select-tile ${canHover ? 'hoverable' : ''}`}
                onClick={() => handleSelectTop('left', i)}
              >
                <FlipCard
                  interactive={false}
                  flipped={flipped}
                  frontText="flag"
                  backContent={<img className="back-flag" src={c.flag} alt={c.nameJa} />}
                />
              </div>
            );
          })}
        </div>

        {/* 右：name 面 */}
        <div className="board">
          {right9.map((c, i) => {
            const flipped = rightFlips[i];
            const canHover = flipped; // ← 表のみ hoverable
            return (
              <div
                key={`AR-${c.id}-${i}`}
                className={`select-tile ${canHover ? 'hoverable' : ''}`}
                onClick={() => handleSelectTop('right', i)}
              >
                <FlipCard
                  interactive={false}
                  flipped={flipped}
                  frontText="name"
                  backContent={<span className="back-text">{c.nameJa}</span>}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 下段：4枚（判定色を枠で表示） */}
      <div className="answer-bottom">
        {bottom.map((item, idx) => {
          const result = bottomResult[idx]; // 'ok' | 'ng' | null
          const slotClass =
            'answer-slot' +
            (result === 'ok' ? ' is-correct' : result === 'ng' ? ' is-wrong' : '');

          return (
            <div className={slotClass} key={`B-${idx}`}>
              <FlipCard
                flipped={bottomOpen[idx]}  // ✅ ここを修正！
                onToggle={() => handleBottomClick(idx)}
                frontText={item.kind === 'name' ? 'name' : 'flag'}
                backContent={
                  item.kind === 'name'
                    ? <span className="back-text">{item.data.nameJa}</span>
                    : <img className="back-flag" src={item.data.flag} alt={item.data.nameJa} />
                }
              />
            </div>
          );
        })}
      </div>

      {/* 正解／不正解フィードバック表示 */}
      {feedback && (
        <div className={`judge-overlay ${feedback === 'ok' ? 'ok' : 'ng'}`}>
          {feedback === 'ok' ? '○' : '×'}
        </div>
      )}


    </div>
  );
}
