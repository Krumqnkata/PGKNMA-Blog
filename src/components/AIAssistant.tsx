import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import { Loader2, SendHorizontal, X } from "lucide-react";

import { SiteArt } from "@/components/art/SiteArt";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { ApiResponseError, askAssistant } from "@/lib/api";
import type { AssistantSource, AssistantTurn } from "@/lib/api";
import { cn } from "@/lib/utils";

const MAX_QUESTION_LENGTH = 500;
const HISTORY_TURNS = 4;
const EXAMPLE_QUESTIONS = [
  "Как да предложа песен за звънеца?",
  "Какви са предстоящите събития?",
  "Как се избира „Меме на седмицата“?",
];
const TURNSTILE_CODES = new Set(["turnstile_required", "turnstile_failed"]);
const BUBBLE_SESSION_KEY = "pgknma-ai-bubble-shown-v1";
const BUBBLE_DELAY_MS = 4000;
const BUBBLE_VISIBLE_MS = 9000;

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: AssistantSource[];
  isError?: boolean;
}

/**
 * Floating AI assistant. It answers only from the site's content; the
 * conversation lives in memory and disappears when the page is reloaded.
 */
const AIAssistant = () => {
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [aiSession, setAiSession] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const nextId = useRef(1);
  const listEndRef = useRef<HTMLDivElement>(null);

  const username = isAuthenticated ? user?.username?.trim() : "";
  const greetingTitle = username ? `Здравейте, ${username}! 👋` : "Здравейте! 👋";
  const needsTurnstile = !isAuthenticated && !aiSession;
  const trimmed = question.trim();
  const canSend = Boolean(trimmed) && !isSending && (!needsTurnstile || Boolean(turnstileToken));

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isSending]);

  // The "Питай ме!" bubble pops out once per browser session, a little after the page loads.
  useEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(BUBBLE_SESSION_KEY) === "1";
    } catch {
      // Storage can be blocked; then the bubble simply shows again next time.
    }
    if (alreadyShown) return undefined;

    let hideTimer: number | undefined;
    const showTimer = window.setTimeout(() => {
      setShowBubble(true);
      try {
        sessionStorage.setItem(BUBBLE_SESSION_KEY, "1");
      } catch {
        // Ignore: see above.
      }
      hideTimer = window.setTimeout(() => setShowBubble(false), BUBBLE_VISIBLE_MS);
    }, BUBBLE_DELAY_MS);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setShowBubble(false);
  };

  const resetTurnstile = () => {
    setTurnstileToken(null);
    setTurnstileKey((key) => key + 1);
  };

  const addMessage = (message: Omit<ChatMessage, "id">) => {
    const id = nextId.current++;
    setMessages((current) => [...current, { ...message, id }]);
  };

  const send = async (text: string) => {
    const value = text.trim().slice(0, MAX_QUESTION_LENGTH);
    if (!value || isSending) return;

    const history: AssistantTurn[] = messages
      .filter((message) => !message.isError)
      .slice(-HISTORY_TURNS)
      .map(({ role, content }) => ({ role, content: content.slice(0, 1000) }));

    addMessage({ role: "user", content: value });
    setQuestion("");
    setIsSending(true);
    try {
      const reply = await askAssistant({
        question: value,
        history,
        ...(needsTurnstile && turnstileToken ? { turnstile_token: turnstileToken } : {}),
        ...(!isAuthenticated && aiSession ? { ai_session: aiSession } : {}),
      });
      if (reply.ai_session) setAiSession(reply.ai_session);
      addMessage({ role: "assistant", content: reply.answer, sources: reply.sources });
    } catch (error) {
      const code = error instanceof ApiResponseError ? error.code : undefined;
      if (code && TURNSTILE_CODES.has(code)) setAiSession(null);
      addMessage({
        role: "assistant",
        content: error instanceof Error ? error.message : "Асистентът не е достъпен в момента.",
        isError: true,
      });
    } finally {
      // A Turnstile token works only once.
      if (needsTurnstile) resetTurnstile();
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (canSend) void send(question);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (canSend) void send(question);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {showBubble && !open && (
        <div className="ai-assistant-bubble fixed bottom-[calc(var(--site-bottom-clearance)+4.5rem)] left-4 z-40 flex max-w-[15rem] items-start gap-1 rounded-2xl rounded-bl-md border border-primary/25 bg-card px-3 py-2.5 text-sm shadow-xl md:left-8">
          <button
            type="button"
            onClick={() => handleOpenChange(true)}
            className="text-left leading-snug text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="font-semibold">Здравейте! 👋</span>{" "}
            Имате въпрос за училището? Питайте ме!
          </button>
          <button
            type="button"
            onClick={() => setShowBubble(false)}
            className="-mr-1 -mt-0.5 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Скрий подканата на ИИ асистента"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
      <SheetTrigger asChild>
        {/* Bottom left, mirroring the "back to top" rocket on the right. */}
        <Button
          size="icon"
          className="ai-assistant-fab fixed bottom-[calc(var(--site-bottom-clearance)+1rem)] left-4 z-40 h-12 w-12 rounded-full shadow-lg transition-transform duration-300 hover:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100 md:left-8 [&_svg]:size-9"
          aria-label="Отвори ИИ асистента"
          title="ИИ асистент"
        >
          <SiteArt name="robot" className="ai-assistant-robot" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="flex w-full flex-col gap-4 p-4 sm:max-w-md sm:p-5">
        <SheetHeader className="pr-10 text-left">
          <SheetTitle className="flex items-center gap-2">
            <SiteArt name="robot" className="h-8 w-8" />
            ИИ асистент
          </SheetTitle>
          <SheetDescription>
            Отговаря само от информацията в сайта и може да греши. Не пишете лични данни.
          </SheetDescription>
        </SheetHeader>

        <div className="-mx-1 flex-1 overflow-y-auto px-1" aria-live="polite">
          {/* The greeting is only shown; it is never sent to the model as history. */}
          <div className="mb-3 flex items-end gap-2">
            <SiteArt name="robot" className="h-9 w-9" />
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
              <p className="font-semibold">{greetingTitle}</p>
              <p className="mt-1">
                Аз съм ИИ асистентът на ПГКНМА Блог. Мога да помогна с въпроси за новините, събитията,
                програмата, правилата и как работи сайтът. Какво ви интересува?
              </p>
            </div>
          </div>
          {messages.length === 0 ? (
            <div className="space-y-2 pl-11 text-sm">
              <p className="text-xs font-semibold text-muted-foreground">Можете да започнете с:</p>
              <div className="flex flex-col gap-2">
                {EXAMPLE_QUESTIONS.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setQuestion(example)}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-left text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      message.role === "user" && "rounded-br-md bg-primary text-primary-foreground",
                      message.role === "assistant" && !message.isError && "rounded-bl-md bg-muted text-foreground",
                      message.isError && "rounded-bl-md border border-destructive/25 bg-destructive/5 text-destructive",
                    )}
                  >
                    <span className="sr-only">{message.role === "user" ? "Вие: " : "Асистент: "}</span>
                    <p className="whitespace-pre-line">{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 border-t border-border/60 pt-2">
                        <p className="text-xs font-semibold text-muted-foreground">Източници:</p>
                        <ul className="mt-1 flex flex-wrap gap-1.5">
                          {message.sources.map((source) => (
                            <li key={`${source.url}-${source.title}`}>
                              <Link
                                to={source.url}
                                onClick={() => setOpen(false)}
                                className="inline-block rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                {source.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </li>
              ))}
              {isSending && (
                <li className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    Мисля…
                  </div>
                </li>
              )}
            </ul>
          )}
          <div ref={listEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          {needsTurnstile && (
            <div className="flex max-w-full justify-center overflow-x-auto">
              <Turnstile
                key={turnstileKey}
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ""}
                onSuccess={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
              />
            </div>
          )}
          <div className="flex items-end gap-2">
            <label htmlFor="ai-assistant-question" className="sr-only">Вашият въпрос</label>
            <Textarea
              id="ai-assistant-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value.slice(0, MAX_QUESTION_LENGTH))}
              onKeyDown={handleKeyDown}
              placeholder="Напишете въпрос…"
              rows={2}
              maxLength={MAX_QUESTION_LENGTH}
              className="min-h-[2.75rem] resize-none"
            />
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={!canSend} aria-label="Изпрати въпроса">
              {isSending
                ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                : <SendHorizontal className="h-4 w-4" aria-hidden="true" />}
            </Button>
          </div>
          <p className="text-right text-xs text-muted-foreground">{trimmed.length}/{MAX_QUESTION_LENGTH}</p>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AIAssistant;
