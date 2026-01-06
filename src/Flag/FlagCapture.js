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
    String(s ?? "").trim().replace(/[^\w\-ぁ-んァ-ヶ一-龠]/g, "_");

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
    // 二重開始防止：同じsetIndexで既に開始済みなら何もしない
    if (currentSetIndex === setIndex && currentSetSessionId) return;

    currentSetIndex = setIndex;
    setStartedAt = Date.now();

    const ts = makeYmdHis();
    // ★ここがファイル名の核（participant + runType + set + 時刻）
    currentSetSessionId = `${safe(participant)}_${safe(runType)}_set${setIndex + 1}_${ts}`;

    console.log("[FlagCapture] beginSet", {
      setIndex,
      currentSetSessionId,
    });
  }

  // Set終了時に1回呼ぶ（JSON保存）
  async function saveSet(extra = {}) {
    if (!active) return { ok: false, error: "session not active" };
    if (currentSetSessionId == null || currentSetIndex == null) {
      return { ok: false, error: "set not started" };
    }

    const endedAt = Date.now();

    const body = {
      participant,
      runType,
      runLabel: runType,          // PHP互換
      set: String(currentSetIndex + 1), // 1-based
      sessionId: currentSetSessionId,   // ★PHPがファイル名に使う
      startedAt: setStartedAt,
      endedAt,
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
    saveSet,
  };
}
