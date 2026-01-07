// src/audio/AudioCapture.js
// Chrome / Edge 前提（MediaRecorder）
// 目的：beginSession() で録音開始 → finishSession() で停止 + アップロード
//       Controller側は開始/終了タイミングだけを担当する

export default function createAudioCapture(options = {}) {
    const {
        timesliceMs = 10_000,                 // 長時間安定のためのchunk間隔
        uploadUrl = "https://shigematsu.nkmr.io/m1_project/api/upload_audio.php",      // ★デフォルトのアップロード先
        autoDownloadOnUploadFail = false,     // ★アップロード失敗時にローカル保存するか
        audioConstraints = {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
        },
    } = options;

    // ===== state =====
    let startMs = null;

    let stream = null;
    let mediaRecorder = null;
    let chunks = [];
    let audioMimeType = "audio/webm";

    // ★セッション管理（Controllerはここを直接触らない）
    let currentSessionId = null;
    let currentExtra = {};

    // --- utils ---
    function pickMimeType() {
        if (window.MediaRecorder?.isTypeSupported?.("audio/webm;codecs=opus")) {
            return "audio/webm;codecs=opus";
        }
        if (window.MediaRecorder?.isTypeSupported?.("audio/webm")) {
            return "audio/webm";
        }
        if (window.MediaRecorder?.isTypeSupported?.("audio/mp4")) {
            return "audio/mp4";
        }
        return ""; // fallback（ブラウザが決める）
    }

    function isRecording() {
        return mediaRecorder && mediaRecorder.state === "recording";
    }

    function makeSessionId(prefix = "session") {
        const ts = new Date().toISOString().replace(/[:.]/g, "-");
        return `${prefix}_${ts}`;
    }

    // --- local download (optional backup) ---
    function downloadBlob(blob, filename = "recording.webm") {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    // --- safety: emergency stop ---
    async function forceStop() {
        try {
            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
            }

        } catch (_) { }

        try {
            stream?.getTracks()?.forEach((t) => t.stop());
        } catch (_) { }

        startMs = null;
        stream = null;
        mediaRecorder = null;
        chunks = [];
        audioMimeType = "audio/webm";

        currentSessionId = null;
        currentExtra = {};
    }


    // --- core ---
    async function start() {
        // ★残骸があれば掃除（2回目以降の安定化）
        if (stream || mediaRecorder || chunks.length) {
            await forceStop();
        }

        // 二重start防止
        if (startMs !== null || isRecording()) return;

        // MediaRecorderが無い環境は弾く
        if (!window.MediaRecorder) {
            throw new Error("MediaRecorder is not supported in this browser.");
        }

        startMs = performance.now();

        // mic permission
        stream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraints,
        });

        audioMimeType = pickMimeType();

        mediaRecorder = new MediaRecorder(
            stream,
            audioMimeType ? { mimeType: audioMimeType } : undefined
        );

        chunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onerror = (e) => {
            console.warn("[AudioCapture] MediaRecorder error:", e);
        };

        // timeslice を入れておくと長時間で安定しやすい
        mediaRecorder.start(timesliceMs);

        console.log(
            "[AudioCapture] recorder state:",
            mediaRecorder.state,
            "mime:",
            mediaRecorder.mimeType
        );
    }

    async function stop() {
        const duration_ms = startMs ? Math.round(performance.now() - startMs) : 0;

        const audioBlob = await new Promise((resolve) => {

            if (!mediaRecorder) return resolve(null);

            const mr = mediaRecorder;

            mr.onstop = () => {
                const type = mr.mimeType || audioMimeType || "audio/webm";
                const blob = new Blob(chunks, { type });
                resolve(blob);
            };

            try {
                // ★最後の取りこぼし防止（対応ブラウザのみ）
                if (mr.state === "recording" && typeof mr.requestData === "function") {
                    mr.requestData();
                }

                if (mr.state !== "inactive") mr.stop();
                else resolve(new Blob(chunks, { type: mr.mimeType || audioMimeType || "audio/webm" }));
            } catch (e) {
                console.warn("[AudioCapture] mediaRecorder.stop failed:", e);
                resolve(null);
            }
        });

        // stop tracks（マイク解放）
        try {
            stream?.getTracks()?.forEach((t) => t.stop());
        } catch (_) { }

        // reset（録音状態のみ）
        startMs = null;
        stream = null;
        mediaRecorder = null;
        chunks = [];
        audioMimeType = "audio/webm";

        return { audioBlob, duration_ms };
    }

    // --- upload helper ---
    async function uploadBlob({
        url = uploadUrl,
        sessionId = "session",
        extra = {},
        audioBlob,
        duration_ms = 0,
    }) {

          console.log("[AudioCapture] upload to:", url);

        if (!audioBlob) return { ok: false, error: "no audioBlob" };

        const fd = new FormData();
        fd.append("sessionId", sessionId);
        fd.append("duration_ms", String(duration_ms));

        Object.entries(extra).forEach(([k, v]) => {
            if (v === undefined || v === null) return;
            fd.append(k, String(v));
        });

        // filename はサーバ側で付け直す前提でもOK
        fd.append("audio", audioBlob, `${sessionId}.webm`);

        const res = await fetch(url, { method: "POST", body: fd });
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`Upload failed: ${res.status} ${text}`);
        }

        return await res.json();
    }

    // --- public: high-level session API (Controller向け) ---
    async function beginSession({ sessionId, extra = {}, prefix = "session" } = {}) {
        // すでに録音中なら何もしない（必要なら throw に変えてもOK）
        if (isRecording()) return { sessionId: currentSessionId };

        currentSessionId = sessionId || makeSessionId(prefix);
        currentExtra = extra;

        await start();
        return { sessionId: currentSessionId };
    }

    async function finishSession({ url } = {}) {
        console.log("[AudioCapture] finishSession url:", url || uploadUrl); // ←追加
        const sid = currentSessionId || makeSessionId("session");
        const extra = currentExtra || {};

        const { audioBlob, duration_ms } = await stop();
        if (!audioBlob) {
            // セッションだけはリセットしておく
            currentSessionId = null;
            currentExtra = {};
            return { ok: false, error: "no audioBlob" };
        }

        try {
            const result = await uploadBlob({
                url: url || uploadUrl,
                sessionId: sid,
                extra,
                audioBlob,
                duration_ms,
            });

            // 成功したらセッション情報リセット
            currentSessionId = null;
            currentExtra = {};
            return result;
        } catch (e) {
            console.warn("[AudioCapture] upload failed:", e);

            // ★任意：失敗時にローカル保存してデータロスト防止
            if (autoDownloadOnUploadFail) {
                try {
                    downloadBlob(audioBlob, `${sid}_${duration_ms}ms_recording.webm`);
                } catch (_) { }
            }

            // セッション情報リセット
            currentSessionId = null;
            currentExtra = {};

            throw e; // Controller側で catch できるように投げる
        }
    }

    // --- backward compatible APIs (残しておく) ---
    async function stopAndUpload({
        url = uploadUrl,
        sessionId = "session",
        extra = {},
    } = {}) {
        const { audioBlob, duration_ms } = await stop();
        return await uploadBlob({ url, sessionId, extra, audioBlob, duration_ms });
    }

    async function stopAndDownload(prefix = "session") {
        const { audioBlob, duration_ms } = await stop();
        if (audioBlob) downloadBlob(audioBlob, `${prefix}_${duration_ms}ms_recording.webm`);
        return { audioBlob, duration_ms };
    }

    return {
        // Controller向け（推奨）
        beginSession,
        finishSession,

        // 低レベル（必要なら使う）
        start,
        stop,
        uploadBlob,

        // 互換
        stopAndUpload,
        stopAndDownload,
        downloadBlob,
        forceStop,
        isRecording,
    };
}
