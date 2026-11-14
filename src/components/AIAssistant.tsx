import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Turnstile } from "@marsidev/react-turnstile";
import { ArrowLeft, History, Loader2, MessageSquarePlus, SendHorizontal, Trash2, X } from "lucide-react";

import { SiteArt } from "@/components/art/SiteArt";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  ApiResponseError,
  askAssistant,
  deleteAssistantConversation,
  getAssistantConversation,
  getAssistantConversations,
} from "@/lib/api";
import type { AssistantAnswerSource, AssistantSource, AssistantTurn } from "@/lib/api";
import { formatSiteDateTime } from "@/lib/date-time";
import { cn } from "@/lib/utils";

const MAX_QUESTION_LENGTH = 500;
const HISTORY_TURNS = 6;
const EXAMPLE_QUESTIONS = [
  "Какво имаме утре в 11б?",
  "Какви събития предстоят?",
  "Колко точки имам?",
  "Кое меме води тази седмица?",
];
const TURNSTILE_CODES = new Set(["turnstile_required", "turnstile_failed"]);
const BUBBLE_SESSION_KEY = "pgknma-ai-bubble-shown-v1";
const BUBBLE_DELAY_MS = 4000;
const BUBBLE_VISIBLE_MS = 9000;
/** Anonymous visitors: the conversation stays only in this browser. */
export const ANONYMOUS_CHAT_KEY = "pgknma-ai-chat-v1";
const MAX_STORED_MESSAGES = 40;
const CONVERSATIONS_KEY = ["ai-conversations"] as const;

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: AssistantSource[];
  answerSource?: AssistantAnswerSource;
  isError?: boolean;
}

type StoredMessage = Omit<ChatMessage, "id" | "isError">;

function readAnonymousChat(): StoredMessage[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(ANONYMOUS_CHAT_KEY) || "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is StoredMessage => (
      (item?.role === "user" || item?.role === "assistant") && typeof item?.content === "string"
    )).slice(-MAX_STORED_MESSAGES);
  } catch {
    return [];
  }
}

function writeAnonymousChat(messages: ChatMessage[]) {
  try {
    const stored: StoredMessage[] = messages
      .filter((message) => !message.isError)
      .slice(-MAX_STORED_MESSAGES)
      .map(({ role, content, sources, answerSource }) => ({ role, content, sources, answerSource }));
    if (stored.length) localStorage.setItem(ANONYMOUS_CHAT_KEY, JSON.stringify(stored));
    else localStorage.removeItem(ANONYMOUS_CHAT_KEY);
  } catch {
    // Storage can be blocked (private mode); the chat then lives only in memory.
  }
}

const SOURCE_LABELS: Partial<Record<AssistantAnswerSource, string>> = {
  rule: "⚡ Отговор от сайта",
  ai: "🤖 ИИ — може да греши",
};

/**
 * Floating AI assistant. It answers from the site's rules first and asks the
 * AI only when there is no ready answer. Logged-in users get their
 * conversations saved on the server; anonymous visitors keep them in this browser.
 */
const AIAssistant = () => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [showBubble, setShowBubble] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [question, setQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [aiSession, setAiSession] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const nextId = useRef(1);
  const loadedLatest = useRef(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  const username = isAuthenticated ? user?.username?.trim() : "";
  const greetingTitle = username ? `Здравейте, ${username}! 👋` : "Здравейте! 👋";
  const needsTurnstile = !isAuthenticated && !aiSession;
  const trimmed = question.trim();
  const canSend = Boolean(trimmed) && !isSending && !isLoadingConversation && (!needsTurnstile || Boolean(turnstileToken));

  const withIds = (items: Omit<ChatMessage, "id">[]) => items.map((item) => ({ ...item, id: nextId.current++ }));

  const conversationsQuery = useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: getAssistantConversations,
    enabled: open && isAuthenticated && view === "history",
  });

  // Logging in or out switches between the server history and the browser one.
  useEffect(() => {
    loadedLatest.current = false;
    setConversationId(null);
    setView("chat");
    setMessages(isAuthenticated ? [] : withIds(readAnonymousChat()));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) writeAnonymousChat(messages);
  }, [messages, isAuthenticated]);

  const openConversation = async (id: number) => {
    setIsLoadingConversation(true);
    setView("chat");
    try {
      const detail = await getAssistantConversation(id);
      setMessages(withIds(detail.messages.map((message) => ({
        role: message.role,
        content: message.content,
        sources: message.sources,
        answerSource: message.answer_source || undefined,
      }))));
      setConversationId(detail.id);
    } catch (error) {
      setMessages(withIds([{ role: "assistant", content: error instanceof Error ? error.message : "Разговорът не може да се зареди.", isError: true }]));
      setConversationId(null);
    } finally {
      setIsLoadingConversation(false);
    }
  };

  // When a logged-in user opens the chat, continue the latest conversation.
  useEffect(() => {
    if (!open || !isAuthenticated || loadedLatest.current) return;
    loadedLatest.current = true;
    void (async () => {
      try {
        const conversations = await queryClient.fetchQuery({ queryKey: CONVERSATIONS_KEY, queryFn: getAssistantConversations });
        if (conversations[0]) await openConversation(conversations[0].id);
      } catch {
        // No history yet or the backend is older: start a fresh chat.
      }
    })();
    // openConversation is stable enough for this one-off load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isAuthenticated, queryClient]);

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

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setView("chat");
  };

  const removeConversation = async (id: number) => {
    try {
      await deleteAssistantConversation(id);
      if (id === conversationId) startNewConversation();
      await queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Разговорът не може да се изтрие.");
    }
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
      const reply = await askAssistant(
        isAuthenticated
          ? { question: value, ...(conversationId ? { conversation_id: conversationId } : {}) }
          : {
            question: value,
            history,
            ...(needsTurnstile && turnstileToken ? { turnstile_token: turnstileToken } : {}),
            ...(aiSession ? { ai_session: aiSession } : {}),
          },
      );
      if (reply.ai_session) setAiSession(reply.ai_session);
      if (reply.conversation_id) {
        setConversationId(reply.conversation_id);
        void queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
      }
      addMessage({ role: "assistant", content: reply.answer, sources: reply.sources, answerSource: reply.answer_source });
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

      <SheetContent side="left" className="flex w-full flex-col gap-3 p-4 sm:max-w-md sm:p-5">
        <SheetHeader className="pr-10 text-left">
          <SheetTitle className="flex items-center gap-2">
            <SiteArt name="robot" className="h-8 w-8" />
            ИИ асистент
          </SheetTitle>
          <SheetDescription>
            Отговаря от информацията в сайта и може да греши. Не пишете лични данни.
            {isAuthenticated ? " Разговорите ви се пазят 90 дни." : " Разговорът се пази само в този браузър."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-2">
          {view === "history" ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setView("chat")}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Към разговора
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" size="sm" onClick={startNewConversation} disabled={isSending}>
                <MessageSquarePlus className="h-4 w-4" aria-hidden="true" /> Нов разговор
              </Button>
              {isAuthenticated && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setView("history")}>
                  <History className="h-4 w-4" aria-hidden="true" /> История
                </Button>
              )}
            </>
          )}
        </div>

        {view === "history" ? (
          <div className="-mx-1 flex-1 overflow-y-auto px-1">
            {conversationsQuery.isLoading ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Зареждане…
              </p>
            ) : conversationsQuery.isError ? (
              <p className="text-sm text-destructive">Историята не може да се зареди.</p>
            ) : (conversationsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Още нямате запазени разговори.</p>
            ) : (
              <ul className="space-y-2" aria-label="Запазени разговори">
                {(conversationsQuery.data ?? []).map((conversation) => (
                  <li key={conversation.id} className="flex items-center gap-1 rounded-xl border border-border bg-background">
                    <button
                      type="button"
                      onClick={() => void openConversation(conversation.id)}
                      className={cn(
                        "min-w-0 flex-1 rounded-xl px-3 py-2 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        conversation.id === conversationId && "bg-primary/5",
                      )}
                    >
                      <span className="block truncate text-sm font-semibold">{conversation.title}</span>
                      <span className="block text-xs text-muted-foreground">{formatSiteDateTime(conversation.updated_at)}</span>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mr-1 h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => void removeConversation(conversation.id)}
                      aria-label={`Изтрий разговора „${conversation.title}“`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="-mx-1 flex-1 overflow-y-auto px-1" aria-live="polite">
            {/* The greeting is only shown; it is never sent to the model as history. */}
            <div className="mb-3 flex items-end gap-2">
              <SiteArt name="robot" className="h-9 w-9" />
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
                <p className="font-semibold">{greetingTitle}</p>
                <p className="mt-1">
                  Аз съм ИИ асистентът на ПГКНМА Блог. Мога да помогна с програмата, събитията, новините,
                  точките и мисиите, правилата и как работи сайтът. Какво ви интересува?
                </p>
              </div>
            </div>
            {isLoadingConversation ? (
              <p className="flex items-center gap-2 pl-11 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Зареждане на разговора…
              </p>
            ) : messages.length === 0 ? (
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
                                {source.url.startsWith("/") ? (
                                  <Link
                                    to={source.url}
                                    onClick={() => setOpen(false)}
                                    className="inline-block rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  >
                                    {source.title}
                                  </Link>
                                ) : (
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  >
                                    {source.title} ↗
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {message.role === "assistant" && message.answerSource && SOURCE_LABELS[message.answerSource] && (
                        <p className="mt-2 text-[0.7rem] font-semibold text-muted-foreground">{SOURCE_LABELS[message.answerSource]}</p>
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
        )}

        {view === "chat" && (
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
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AIAssistant;
