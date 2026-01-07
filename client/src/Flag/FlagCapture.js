// src/Flag/FlagCapture.js
export default function createFlagCapture(options = {}) {
  const {
    uploadUrl = "https://shigematsu.nkmr.io/m1_project/api/upload_flag.php",
    autoDownloadOnUploadFail = true,
  } = options;

  // ===== session meta (Loginで入る) =====
  let active = false;
  let participant = null;
  let runType = null;

  // ===== set meta (Set開始で入る) =====
  let currentSetIndex = null;     // 0-based
  let currentSetSessionId = null; // ファイル名用のID
  let setStartedAt = null;
  let setStatus = "ok";        // "ok" | "aborted"
  let abortReason = null;
  let abortAt = null;


  // ===== events =====
  let events = []; // ← ★ set内のイベント列

  // ===== utils =====
  const pad2 = (n) => String(n).padStart(2, "0");
  const makeYmdHis = () => {
    const d = new Date();
    return (
      d.getFullYear() +
      pad2(d.getMonth() + 1) +
      pad2(d.getDate()) +
      "_" +
      pad2(d.getHours()) +
      pad2(d.getMinutes()) +
      pad2(d.getSeconds())
    );
  };

  const safe = (s) =>
    String(s ?? "")
      .trim()
      .replace(/[ \u3000]+/g, "_")
      .replace(/[^\w\-ぁ-んァ-ヶー一-龠]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, ""); // ★先頭末尾の_を消す


  function isActive() {
    return active;
  }

  // Loginで1回呼ぶ（保存はしない）
  async function beginSession({ participant: p, runType: r } = {}) {
    participant = p ?? null;
    runType = r ?? null;
    active = true;
    console.log("[FlagCapture] beginSession", { participant, runType });
  }

  // Set開始で1回呼ぶ（ここで set用sessionId を作る）
  function beginSet({ setIndex } = {}) {
    if (!active) {
      console.warn("[FlagCapture] beginSet but session not active");
      return;
    }


    currentSetIndex = setIndex;
    setStartedAt = Date.now();
    setStatus = "ok";
    abortReason = null;
    abortAt = null;
    events = []; // ★このセットのイベントをここから貯める

    const ts = makeYmdHis();
    // ★ここがファイル名の核（participant + runType + set + 時刻）
    currentSetSessionId = `${safe(participant)}_${safe(runType)}_set${setIndex + 1}_${ts}`;

    console.log("[FlagCapture] beginSet", {
      setIndex,
      currentSetSessionId,
    });
  }


  function abortSet(reason = "unknown") {
    if (!active) return;
    if (currentSetIndex == null || currentSetSessionId == null) return;
    if (setStatus === "aborted") return;

    abortAt = Date.now();
    setStatus = "aborted";
    abortReason = String(reason);

    events.push({
      t: abortAt,
      type: "SET_ABORT",
      setIndex: currentSetIndex,
      payload: { reason: abortReason },
    });
  }

  function log(type, payload = {}) {
    if (!active) return;
    if (currentSetIndex == null || currentSetSessionId == null) {
      console.warn("[FlagCapture] log but set not started", { type, payload });
      return;
    }

    events.push({
      t: Date.now(),
      type,
      setIndex: currentSetIndex, // 0-based（あなたの内部運用に合わせる）
      ...payload,
    });
  }

  // Set終了時に1回呼ぶ（JSON保存）
  async function saveSet(extra = {}) {
    if (events.some(e => e.type === "SET_END")) {
      return { ok: false, error: "set already ended" };
    }

    if (!active) return { ok: false, error: "session not active" };
    if (currentSetSessionId == null || currentSetIndex == null) {
      return { ok: false, error: "set not started" };
    }

    const endedAt = Date.now();

    // ★セット終了ログ（必ず1回だけ）
    events.push({
      t: endedAt,
      type: "SET_END",
      setIndex: currentSetIndex, // 0-based
      payload: {
        reason: setStatus === "aborted" ? "aborted" : "completed",
        eventCountBefore: events.length,
      },
    });


    const body = {
      participant,
      runType,
      runLabel: runType,                 // PHP互換
      set: String(currentSetIndex + 1),  // 1-based（PHP互換）
      sessionId: currentSetSessionId,    // ★ファイル名に使いたいキー
      startedAt: setStartedAt,
      endedAt,

      // ★追加：分析しやすい構造（将来こっちを主にしたいなら）
      meta: {
        participant,
        runType,
        setIndex: currentSetIndex,       // 0-basedも入れておくと便利
        set: String(currentSetIndex + 1),
        sessionId: currentSetSessionId,
        startedAt: setStartedAt,
        endedAt,

        status: setStatus,              // "ok" or "aborted"
        abortReason: abortReason,       // okならnull
        abortAt: abortAt,               // okならnull
      },

      // ★追加：イベント列
      events,

      // ★呼び出し側が足したいもの
      ...extra,
    };


    try {
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "upload failed");

      console.log("[FlagCapture] saved:", json.filename ?? json.saved);

      // 次のセットのために「セット状態だけ」クリア
      currentSetIndex = null;
      currentSetSessionId = null;
      setStartedAt = null;
      setStatus = "ok";
      abortReason = null;
      abortAt = null;
      events = [];

      return json;
    } catch (e) {
      console.error("[FlagCapture] upload failed:", e);

      if (autoDownloadOnUploadFail) {
        const blob = new Blob([JSON.stringify(body, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `set_local_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      return { ok: false, error: String(e?.message || e) };
    }
  }

  return {
    isActive,
    beginSession,
    beginSet,
    log,
    abortSet,
    saveSet,
  };
}
