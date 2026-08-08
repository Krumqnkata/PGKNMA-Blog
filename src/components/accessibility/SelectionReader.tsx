import { useEffect, useRef, useState } from "react";
import { Square, Volume2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const MAX_SPEECH_LENGTH = 12_000;

function getSelectedText() {
  return window.getSelection()?.toString().replace(/\s+/g, " ").trim() ?? "";
}

export default function SelectionReader() {
  const [selectedText, setSelectedText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!supported) return;

    const captureSelection = () => {
      const text = getSelectedText();
      if (text) setSelectedText(text.slice(0, MAX_SPEECH_LENGTH));
      else if (!utteranceRef.current) setSelectedText("");
    };

    document.addEventListener("selectionchange", captureSelection);
    return () => {
      document.removeEventListener("selectionchange", captureSelection);
      if (utteranceRef.current) window.speechSynthesis.cancel();
    };
  }, [supported]);

  if (!supported || !selectedText) return null;

  const listen = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedText);
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((voice) => voice.lang.toLowerCase().startsWith("bg")) ?? voices[0] ?? null;
    utterance.lang = "bg-BG";
    utterance.rate = 1;
    utterance.onend = () => {
      utteranceRef.current = null;
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setIsSpeaking(false);
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
  };

  const dismiss = () => {
    stop();
    window.getSelection()?.removeAllRanges();
    setSelectedText("");
  };

  return (
    <aside
      className="fixed bottom-4 left-1/2 z-[99990] flex w-[min(36rem,calc(100vw-1rem))] -translate-x-1/2 items-center gap-3 rounded-xl border bg-popover p-3 text-popover-foreground shadow-2xl"
      aria-label="Четене на маркиран текст"
    >
      <Volume2 className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <p className="min-w-0 flex-1 truncate text-sm">{selectedText}</p>
      {isSpeaking ? (
        <Button type="button" size="sm" variant="outline" onPointerDown={(event) => event.preventDefault()} onClick={stop}>
          <Square className="h-4 w-4" aria-hidden="true" />Спри
        </Button>
      ) : (
        <Button type="button" size="sm" onPointerDown={(event) => event.preventDefault()} onClick={listen}>
          <Volume2 className="h-4 w-4" aria-hidden="true" />Преслушай
        </Button>
      )}
      <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0" onPointerDown={(event) => event.preventDefault()} onClick={dismiss} aria-label="Затвори четенето на маркиран текст">
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </aside>
  );
}
