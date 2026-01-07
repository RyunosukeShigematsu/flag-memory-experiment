// src/DigitalClock/SpeechCapture.js
// Chrome(Web Speech API: webkitSpeechRecognition) 前提
// 目的：beginSession() 〜 finishSession() の間に発話があれば textログとして溜める
//       finishSession() で JSON をサーバへアップロード（失敗してもローカルDLで救済可）

export default function createSpeechCapture(options = {}) {
    const {
        uploadUrl = "https://shigematsu.nkmr.io/m1_project/api/upload_text.php",
        lang = "ja-JP",
        autoDownloadOnUploadFail = true,
    } = options;

    let recognition = null;
    let active = false;

    let meta = {};
    let timeline = [];

    let serverOffsetMs = null; // server_time_ms - perf_now_midpoint
    let sessionStartPerf = null;

    async function syncServerTime(timeUrl = "https://shigematsu.nkmr.io/m1_project/api/time.php") {
        const t0 = performance.now();
        const res = await fetch(timeUrl, { cache: "no-store" });
        const json = await res.json();
        const t1 = performance.now();
        const rtt = t1 - t0;
        const approxClientAtServerTime = t0 + rtt / 2;
        serverOffsetMs = json.server_time_ms - approxClientAtServerTime;
    }

    function randId(len = 5) {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let out = "";
        for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
        return out;
    }

    function sanitize(s) {
        s = String(s ?? "").trim();
        if (!s) return "";
        s = s.replace(/\s+/g, "_");
        // / \ : * ? " < > | # & % を除去（audio php と同じ思想）
        s = s.replace(/[\/\\:\*\?"<>\|\#\&\%]+/g, "");
        return s.slice(0, 50);
    }

    function formatTs(d = new Date()) {
        const pad = (n) => String(n).padStart(2, "0");
        return (
            d.getFullYear() +
            pad(d.getMonth() + 1) +
            pad(d.getDate()) +
            "_" +
            pad(d.getHours()) +
            pad(d.getMinutes()) +
            pad(d.getSeconds())
        );
    }


    function absTimeMs() {
        if (serverOffsetMs == null) return null;
        return Math.round(performance.now() + serverOffsetMs);
    }

    function relMs() {
        if (sessionStartPerf == null) return null;
        return Math.round(performance.now() - sessionStartPerf);
    }

    function isSupported() {
        return "webkitSpeechRecognition" in window;
    }

    function makeFileName() {
        const participant = sanitize(meta?.participant ?? "");
        const sessionId = sanitize(meta?.sessionId ?? "");
        const runLabel = sanitize(meta?.runLabel ?? "");

        // set は数字化して扱う（安全）
        const setNum = Number(meta?.set);
        const set = Number.isFinite(setNum) ? String(setNum) : "";

        // base 決定（participant > sessionId > random）
        let base = "";
        if (participant) base = participant;
        else if (sessionId) base = sessionId;
        else base = randId(5);

        if (runLabel && !/_(check|A|B)$/.test(base)) {
            base += `_${runLabel}`;
        }
        if (set && !/_set\d+$/.test(base)) {
            base += `_set${set}`;
        }

        // ★ts共有が来たらそれを使う（後述）
        const ts = meta?.ts ? sanitize(meta.ts) : formatTs(new Date());
        return `${base}_${ts}.json`;
    }

    function downloadJson(obj, filename) {
        const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    async function beginSession({ participant, set, runLabel, runType, group, extra = {}, timeUrl } = {}) {
        if (active) return;
        if (!isSupported()) {
            console.warn("[STT] SpeechRecognition not supported in this browser.");
            return;
        }

        timeline = []; 
        // サーバ時刻合わせ（任意だが、後で統合解析するならやる価値大）
        try {
            await syncServerTime(timeUrl);
        } catch (e) {
            console.warn("[STT] syncServerTime failed (ok):", e);
            serverOffsetMs = null;
        }

        meta = {
            participant,
            set,
            runLabel,
            runType,
            group,
            ...extra,
            started_at_ms: absTimeMs(),
        };


        sessionStartPerf = performance.now();

        recognition = new window.webkitSpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const res = event.results[i];
                if (!res.isFinal) continue;

                const text = (res[0]?.transcript ?? "").trim();
                if (!text) continue;

                timeline.push({
                    t_ms: relMs(),
                    abs_ms: absTimeMs(),
                    type: "ans",
                    text,
                    confidence: res[0]?.confidence ?? null,
                });
            }
        };


        recognition.onerror = (e) => {
            // network / no-speech / aborted など
            console.warn("[STT] error:", e);
        };

        recognition.onend = () => {
            // finishSession / forceStop で recognition を null にした後に
            // onend が飛ぶことがあるので、それを弾く
            if (!active) return;
            if (!recognition) return;

            // 途中で勝手に止まった場合だけ再開（保険）
            try {
                recognition.start();
            } catch (_) {
                // start連打などで例外になることがあるので握りつぶす
            }
        };


        try {
            recognition.start();
            active = true;
            console.log("[STT] started");
        } catch (e) {
            console.warn("[STT] start failed:", e);
            active = false;
        }
    }

    function pushTimeline(item) {
        timeline.push({
            t_ms: relMs(),
            abs_ms: absTimeMs(),
            ...item,
        });
    }


    async function finishSession() {
        if (!active) return { ok: true, skipped: true };

        active = false;

        // stop
        try {
            recognition?.stop?.();
        } catch (_) { }

        const payload = {
            
            meta: {
                ...meta,
                ended_at_ms: absTimeMs(),
                count: timeline.length,
            },
            timeline,
        };

        const filename = makeFileName();

        // upload
        try {
            const res = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename, payload }),
            });

            let json = null;
            try {
                json = await res.json();
            } catch (_) { }

            if (!res.ok || !json?.ok) {
                throw new Error(
                    `upload failed: status=${res.status}, body=${JSON.stringify(json)}`
                );
            }


            console.log("[STT] uploaded:", json);
            return { ok: true, uploaded: true, filename, response: json };
        } catch (e) {
            console.warn("[STT] upload failed:", e);
            if (autoDownloadOnUploadFail) {
                downloadJson(payload, filename);
            }
            return { ok: false, uploaded: false, filename, error: String(e) };
        } finally {
            recognition = null;
            sessionStartPerf = null;
            serverOffsetMs = null;
        }
    }

    async function forceStop() {
        // 途中離脱などの安全停止（アップロードはしない）
        active = false;
        try {
            recognition?.stop?.();
        } catch (_) { }
        recognition = null;
        sessionStartPerf = null;
    }

    function isActive() {
        return active;
    }

    return {
        beginSession,
        finishSession,
        forceStop,
        isActive,
        pushTimeline,
    };

}
