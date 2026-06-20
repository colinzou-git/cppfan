"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type DictationState =
  | "unsupported"
  | "idle"
  | "requesting_permission"
  | "listening"
  | "processing"
  | "stopped"
  | "permission_denied"
  | "error";

type SpeechResultEvent = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechErrorEvent = { error?: string };

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};

type RecognitionConstructor = new () => Recognition;
type SpeechWindow = Window & {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
};

function insertAtSelection(
  value: string,
  transcript: string,
  textarea: HTMLTextAreaElement | null
) {
  const start = textarea?.selectionStart ?? value.length;
  const end = textarea?.selectionEnd ?? value.length;
  const before = value.slice(0, start);
  const after = value.slice(end);
  const leadingSpace = before.length > 0 && !/\s$/.test(before) ? " " : "";
  const text = transcript.trim();
  return {
    value: `${before}${leadingSpace}${text}${after}`,
    caret: before.length + leadingSpace.length + text.length
  };
}

export function DictationControl({
  textareaRef,
  value,
  onChange,
  disabled = false
}: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [state, setState] = useState<DictationState>("idle");
  const recognitionRef = useRef<Recognition | null>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  function stop() {
    recognitionRef.current?.stop();
    setState("stopped");
  }

  function start() {
    const speechWindow = window as SpeechWindow;
    const RecognitionApi =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!RecognitionApi) {
      setState("unsupported");
      textareaRef.current?.focus();
      return;
    }

    try {
      const recognition = new RecognitionApi();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || "en-US";
      recognition.onstart = () => setState("listening");
      recognition.onresult = (event) => {
        const transcripts: string[] = [];
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          if (result.isFinal && result[0]?.transcript) {
            transcripts.push(result[0].transcript);
          }
        }
        if (!transcripts.length) return;
        setState("processing");
        const inserted = insertAtSelection(
          valueRef.current,
          transcripts.join(" "),
          textareaRef.current
        );
        valueRef.current = inserted.value;
        onChange(inserted.value);
        queueMicrotask(() => {
          textareaRef.current?.focus();
          textareaRef.current?.setSelectionRange(inserted.caret, inserted.caret);
          setState("listening");
        });
      };
      recognition.onerror = (event) => {
        recognitionRef.current = null;
        setState(
          event.error === "not-allowed" || event.error === "service-not-allowed"
            ? "permission_denied"
            : "error"
        );
        textareaRef.current?.focus();
      };
      recognition.onend = () => {
        recognitionRef.current = null;
        setState((current) =>
          current === "permission_denied" || current === "error" || current === "unsupported"
            ? current
            : "stopped"
        );
        textareaRef.current?.focus();
      };
      recognitionRef.current = recognition;
      setState("requesting_permission");
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setState("error");
      textareaRef.current?.focus();
    }
  }

  const active =
    state === "requesting_permission" || state === "listening" || state === "processing";
  const status =
    state === "requesting_permission"
      ? "Requesting microphone permission."
      : state === "listening"
        ? "Listening. Dictated text remains editable and will not be sent automatically."
        : state === "processing"
          ? "Adding dictated text to the prompt."
          : state === "permission_denied"
            ? "Microphone permission was denied. Typing remains available."
            : state === "unsupported"
              ? "Dictation is not supported in this browser. Typing remains available."
              : state === "error"
                ? "Dictation stopped because of a microphone or speech-recognition error. Typing remains available."
                : state === "stopped"
                  ? "Dictation stopped. You can edit the text before sending."
                  : "Dictation uses your browser or device speech-recognition service and never sends automatically.";

  return (
    <div className="flex flex-col gap-1">
      <input
        type="button"
        value={active ? "Stop dictation" : "Start dictation"}
        aria-label={active ? "Stop dictation" : "Start dictation"}
        onClick={active ? stop : start}
        disabled={disabled || state === "permission_denied"}
        className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
      />
      <span className="max-w-sm text-xs text-slate-500" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}

export const dictationTestUtils = { insertAtSelection };
