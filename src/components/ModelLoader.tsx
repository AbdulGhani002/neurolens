import { motion } from "framer-motion";
import { ProgressEvent } from "../lib/transformers";

type Props = {
  status: "idle" | "loading" | "ready" | "error";
  events: ProgressEvent[];
  errorMsg?: string;
  modelId: string;
};

/**
 * Tasteful loading indicator for HF transformer downloads.
 * Shows file progress bars while ONNX weights stream in from the hub.
 */
export default function ModelLoader({ status, events, errorMsg, modelId }: Props) {
  if (status === "ready") return null;

  // collect per-file progress
  const files = new Map<string, ProgressEvent>();
  for (const e of events) {
    if (e.file) {
      const prev = files.get(e.file);
      if (!prev || (e.progress ?? 0) > (prev.progress ?? 0) || e.status === "done") {
        files.set(e.file, e);
      }
    }
  }
  const fileEntries = Array.from(files.entries());

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <SpinnerSVG status={status} />
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent-cyan">
            {status === "error" ? "load failed" : "loading model"}
          </p>
          <p className="font-mono text-sm text-ink-100">{modelId}</p>
        </div>
        {fileEntries.length > 0 && (
          <p className="font-mono text-xs text-ink-400">
            {fileEntries.filter((f) => f[1].status === "done").length} / {fileEntries.length} files
          </p>
        )}
      </div>

      {status === "error" && (
        <p className="text-sm text-accent-coral font-mono">{errorMsg ?? "unknown error"}</p>
      )}

      {fileEntries.length > 0 && (
        <div className="space-y-2">
          {fileEntries.map(([file, ev]) => (
            <div key={file}>
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-ink-300 truncate max-w-[60%]">{file}</span>
                <span className="text-ink-400">
                  {ev.status === "done"
                    ? "done"
                    : ev.total
                    ? `${formatMB(ev.loaded ?? 0)} / ${formatMB(ev.total)}`
                    : (ev.progress ?? 0).toFixed(0) + "%"}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent-cyan to-accent-violet"
                  initial={{ width: 0 }}
                  animate={{
                    width: ev.status === "done" ? "100%" : `${(ev.progress ?? 0).toFixed(1)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === "loading" && fileEntries.length === 0 && (
        <p className="text-xs font-mono text-ink-400">contacting huggingface.co…</p>
      )}
    </div>
  );
}

function SpinnerSVG({ status }: { status: string }) {
  if (status === "error") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="12" fill="none" stroke="#ff6f91" strokeWidth="2" />
        <line x1="9" y1="9" x2="19" y2="19" stroke="#ff6f91" strokeWidth="2" />
        <line x1="19" y1="9" x2="9" y2="19" stroke="#ff6f91" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" className="animate-spin">
      <defs>
        <linearGradient id="spin-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5ee4d4" />
          <stop offset="100%" stopColor="#a472ff" />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="11" fill="none" stroke="#48527a" strokeWidth="2" opacity="0.3" />
      <path
        d="M 14 3 A 11 11 0 0 1 25 14"
        fill="none"
        stroke="url(#spin-grad)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatMB(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}
