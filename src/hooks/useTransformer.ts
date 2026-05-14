import { useEffect, useRef, useState } from "react";
import {
  loadTokenizer,
  loadModel,
  loadPipeline,
  ProgressEvent,
  Device,
  hasWebGPU,
} from "../lib/transformers";

type Status = "idle" | "loading" | "ready" | "error";

type Options = {
  /** quantization (q8 is the safe default — small & fast) */
  dtype?: "fp32" | "fp16" | "q8" | "q4";
  /** "auto" prefers webgpu if available, falls back to wasm */
  device?: Device | "auto";
  /** lazy=true means don't start loading until trigger() is called */
  lazy?: boolean;
};

/** detect whether the user's browser has WebGPU available */
export function useWebGPU() {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    hasWebGPU().then(setAvailable);
  }, []);
  return available;
}

type Resource<T> = {
  status: Status;
  value: T | null;
  error: string | null;
  events: ProgressEvent[];
  trigger: () => void;
};

/* ---------- useTokenizer ---------- */

export function useTokenizer(id: string, options: Options = {}): Resource<Awaited<ReturnType<typeof loadTokenizer>>> {
  const [status, setStatus] = useState<Status>(options.lazy ? "idle" : "loading");
  const [value, setValue] = useState<Awaited<ReturnType<typeof loadTokenizer>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const started = useRef(false);

  const start = () => {
    if (started.current) return;
    started.current = true;
    setStatus("loading");
    loadTokenizer(id, (e) => setEvents((prev) => [...prev, e]))
      .then((tok) => {
        // wrap in updater fn: tokenizers/models/pipelines are callable objects
        // and React would otherwise invoke them as setState(prev => next)
        setValue(() => tok);
        setStatus("ready");
      })
      .catch((e) => {
        setError(String(e?.message ?? e));
        setStatus("error");
      });
  };

  useEffect(() => {
    if (!options.lazy) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, value, error, events, trigger: start };
}

/* ---------- useModel ---------- */

export function useModel(
  id: string,
  options: Options = {}
): Resource<Awaited<ReturnType<typeof loadModel>>> {
  const [status, setStatus] = useState<Status>(options.lazy ? "idle" : "loading");
  const [value, setValue] = useState<Awaited<ReturnType<typeof loadModel>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const started = useRef(false);

  const start = () => {
    if (started.current) return;
    started.current = true;
    setStatus("loading");
    loadModel(id, { dtype: options.dtype, device: options.device }, (e) =>
      setEvents((prev) => [...prev, e])
    )
      .then((m) => {
        setValue(() => m);
        setStatus("ready");
      })
      .catch((e) => {
        setError(String(e?.message ?? e));
        setStatus("error");
      });
  };

  useEffect(() => {
    if (!options.lazy) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, value, error, events, trigger: start };
}

/* ---------- usePipeline ---------- */

export function usePipeline(
  task: string,
  modelId: string,
  options: Options = {}
): Resource<Awaited<ReturnType<typeof loadPipeline>>> {
  const [status, setStatus] = useState<Status>(options.lazy ? "idle" : "loading");
  const [value, setValue] = useState<Awaited<ReturnType<typeof loadPipeline>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const started = useRef(false);

  const start = () => {
    if (started.current) return;
    started.current = true;
    setStatus("loading");
    loadPipeline(task, modelId, { dtype: options.dtype, device: options.device }, (e) =>
      setEvents((prev) => [...prev, e])
    )
      .then((p) => {
        setValue(() => p);
        setStatus("ready");
      })
      .catch((e) => {
        setError(String(e?.message ?? e));
        setStatus("error");
      });
  };

  useEffect(() => {
    if (!options.lazy) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, value, error, events, trigger: start };
}
