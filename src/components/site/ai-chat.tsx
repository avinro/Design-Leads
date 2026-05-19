"use client";

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  memo,
  forwardRef,
  useMemo,
} from "react";
import DOMPurify from "dompurify";
import { MessageCircleQuestion, ArrowUp, Square, AlertCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useLenis } from "@/components/site/lenis-provider";
import { track } from "@/lib/analytics/events";
import { scheduleRefreshLenisBounds } from "@/lib/scroll/refresh-lenis-bounds";
import { ViviThinkingIndicator } from "@/components/site/vivi-thinking-indicator";
import { useStickToBottom } from "@/hooks/use-stick-to-bottom";
import { useVisualViewportInset } from "@/hooks/use-visual-viewport-inset";
import { useLandscapeCompactHeader } from "@/hooks/use-landscape-compact-header";

const SUGGESTION_CHIPS = [
  "What are Ary's strongest design skills?",
  "Tell me about the helloDojo case study",
  "What's Ary's experience with design systems?",
  "What is Ary's design process?",
];

const ALLOWED_TAGS = ["h3", "p", "ul", "li", "strong", "a"];
const ALLOWED_ATTRS = ["href", "target", "rel"];

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRS,
  });
}

type ChatMessage =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; content: string; assistantHtml: string };

const UserBubble = memo(function UserBubble({
  message,
}: {
  message: Extract<ChatMessage, { role: "user" }>;
}) {
  return (
    <div className="ml-auto flex max-w-[85%] gap-2">
      <div className="bg-primary text-primary-foreground flex-1 rounded-2xl rounded-br-none px-4 py-2.5">
        <p className="font-sans text-sm">{message.content}</p>
      </div>
    </div>
  );
});

const AssistantBubble = memo(function AssistantBubble({
  message,
}: {
  message: Extract<ChatMessage, { role: "assistant" }>;
}) {
  return (
    <div className="prose-chat mr-auto max-w-[95%]">
      <div dangerouslySetInnerHTML={{ __html: message.assistantHtml }} />
    </div>
  );
});

const StreamingAssistant = memo(function StreamingAssistant({ content }: { content: string }) {
  const html = useMemo(() => sanitizeHtml(content), [content]);
  return (
    <div className="prose-chat mr-auto max-w-[95%]">
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <span
        className="text-foreground/80 animate-pulse motion-reduce:animate-none"
        aria-hidden="true"
      >
        ▌
      </span>
    </div>
  );
});

const MessageList = memo(function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <>
      {messages.map((message) =>
        message.role === "user" ? (
          <UserBubble key={message.id} message={message} />
        ) : (
          <AssistantBubble key={message.id} message={message} />
        ),
      )}
    </>
  );
});

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border-destructive/50 bg-destructive/10 mr-auto flex max-w-[95%] items-start gap-2 rounded-lg border p-3">
      <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-foreground/80 text-sm">Vivi had trouble responding. Please try again.</p>
        <button
          onClick={onRetry}
          className="text-accent mt-2 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-2 hover:opacity-80"
          type="button"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

interface SuggestionChipsProps {
  onSelect: (text: string) => void;
}

function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div className="space-y-2">
      {SUGGESTION_CHIPS.map((chip) => (
        <button
          key={chip}
          onClick={() => {
            onSelect(chip);
          }}
          type="button"
          className={cn(
            "border-border bg-background/50 hover:bg-muted block w-full touch-manipulation rounded-lg border",
            "min-h-11 px-3 py-2 text-left text-sm transition-colors",
          )}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  disabled: boolean;
  isLoading: boolean;
  onStop: () => void;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(function ChatInput(
  { value, onChange, onSubmit, disabled, isLoading, onStop },
  ref,
) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  const setTextareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  useEffect(() => {
    const textarea = innerRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${String(Math.min(textarea.scrollHeight, 120))}px`;
  }, [value]);

  return (
    <form onSubmit={onSubmit} className="flex touch-manipulation items-end gap-2">
      <textarea
        ref={setTextareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const syntheticEvent = {
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              preventDefault: () => {},
            } as React.SyntheticEvent;
            onSubmit(syntheticEvent);
          }
        }}
        placeholder="Ask Vivi about Ary's work…"
        rows={1}
        className={cn(
          "border-border bg-muted min-h-11 flex-1 resize-none rounded-xl border",
          "px-3.5 py-2.5 font-sans text-sm",
          "placeholder:text-muted-foreground",
          "focus:ring-ring focus:ring-2 focus:outline-none",
          "max-h-[120px] overflow-y-auto",
        )}
        disabled={disabled}
        aria-label="Message input for Vivi"
      />
      {isLoading ? (
        <button
          type="button"
          onClick={() => {
            onStop();
          }}
          className={cn(
            "bg-destructive/20 text-destructive flex size-11 shrink-0 items-center justify-center rounded-full",
            "transition-opacity duration-150 hover:opacity-80",
          )}
          aria-label="Stop message"
        >
          <Square className="size-3.5" aria-hidden />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className={cn(
            "bg-primary text-primary-foreground flex size-11 shrink-0 items-center justify-center rounded-full",
            "disabled:cursor-not-allowed disabled:opacity-40",
            "transition-opacity duration-150",
          )}
          aria-label="Send message"
        >
          <ArrowUp className="size-4" aria-hidden />
        </button>
      )}
    </form>
  );
});

const MOBILE_MAX_BREAKPOINT = 767.5;

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const fabRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastFailedMessagesRef = useRef<ChatMessage[] | null>(null);
  const lenis = useLenis();
  const { scrollRef, onScroll, markForceStick, scrollToBottomIfNeeded } = useStickToBottom();
  const { keyboardInset, viewportHeight } = useVisualViewportInset(open && isMobileViewport);
  const compactHeader = useLandscapeCompactHeader(open);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${String(MOBILE_MAX_BREAKPOINT)}px)`);
    const update = () => {
      setIsMobileViewport(mq.matches);
    };
    update();
    mq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
    };
  }, []);

  const sendWithMessages = useCallback(async (nextMessages: ChatMessage[]): Promise<void> => {
    if (nextMessages.length === 0) return;
    if (nextMessages[nextMessages.length - 1]?.role !== "user") return;

    setStreamingContent("");
    setError(null);
    setIsLoading(true);
    lastFailedMessagesRef.current = null;

    const controller = new AbortController();
    abortRef.current = controller;

    let accumulated = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? "AI is disabled"
            : response.status === 500
              ? "Server error"
              : "Failed to get response",
        );
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { done: isDone, value } = await reader.read();
        done = isDone;
        if (value) {
          accumulated += decoder.decode(value, { stream: true });
          setStreamingContent(accumulated);
        }
      }

      const assistant: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: accumulated,
        assistantHtml: sanitizeHtml(accumulated),
      };
      setMessages([...nextMessages, assistant]);
      setStreamingContent("");
      track({ name: "ai_chat_message_sent", props: { messageCount: nextMessages.length + 1 } });
    } catch (err) {
      const e = err as Error;
      if (e.name === "AbortError") {
        if (accumulated.trim().length > 0) {
          const assistant: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: accumulated,
            assistantHtml: sanitizeHtml(accumulated),
          };
          setMessages([...nextMessages, assistant]);
        }
        setStreamingContent("");
      } else {
        setError(e.message || "Failed to get response");
        lastFailedMessagesRef.current = nextMessages;
        setStreamingContent("");
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isLoading) return;
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
      };
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setInput("");
      markForceStick();
      void sendWithMessages(nextMessages);
    },
    [isLoading, messages, markForceStick, sendWithMessages],
  );

  const handleStop = (): void => {
    abortRef.current?.abort();
  };

  useLayoutEffect(() => {
    if (!open) return;
    const instant = isLoading;
    scrollToBottomIfNeeded({ instant });
  }, [open, messages, streamingContent, isLoading, scrollToBottomIfNeeded]);

  useEffect(() => {
    if (!open || !lenis) return;
    lenis.stop();
    return () => {
      lenis.start();
      scheduleRefreshLenisBounds(lenis);
    };
  }, [open, lenis]);

  const handleOpenChange = (newOpen: boolean): void => {
    if (!newOpen) {
      document.body.style.removeProperty("pointer-events");
    } else {
      markForceStick();
      track({ name: "ai_chat_open", props: {} });
    }
    setOpen(newOpen);
  };

  const handleSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleRetry = (): void => {
    const failed = lastFailedMessagesRef.current;
    setError(null);
    if (failed) {
      markForceStick();
      void sendWithMessages(failed);
    }
  };

  const sheetMobileStyle =
    isMobileViewport && open
      ? {
          height: `${String(viewportHeight)}px`,
          maxHeight: `${String(viewportHeight)}px`,
        }
      : undefined;

  const footerPaddingBottom = `max(env(safe-area-inset-bottom), ${String(keyboardInset)}px, 1rem)`;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button
          ref={fabRef}
          className={cn(
            "fixed z-40",
            "right-4 bottom-8",
            "md:right-6",
            "bg-primary text-primary-foreground",
            "flex size-14 items-center justify-center rounded-full",
            "transition-all duration-200",
            "hover:scale-110 hover:shadow-lg motion-reduce:hover:scale-100 motion-reduce:hover:shadow-md",
            "active:scale-95 motion-reduce:active:scale-100",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
            "touch-manipulation select-none",
          )}
          aria-haspopup="dialog"
          aria-label="Chat with Vivi about Ary's work"
          type="button"
        >
          <MessageCircleQuestion className="size-6" aria-hidden />
        </button>
      </SheetTrigger>

      <SheetContent
        variant="chat"
        className="flex flex-col"
        style={sheetMobileStyle}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          window.setTimeout(() => {
            textareaRef.current?.focus();
          }, 300);
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          fabRef.current?.focus();
        }}
      >
        <SheetHeader
          className={cn(
            "mt-0 shrink-0 gap-0 px-4 pr-14 pb-4 sm:px-6 sm:pb-6",
            compactHeader && "pb-2",
          )}
          style={{ paddingTop: "max(env(safe-area-inset-top), 1.5rem)" }}
        >
          <SheetTitle className={cn(compactHeader && "text-xl sm:text-2xl")}>
            Chat with Vivi
          </SheetTitle>
          {!compactHeader && (
            <SheetDescription>
              Ask about Ary&apos;s work, experience, and design expertise.
            </SheetDescription>
          )}
        </SheetHeader>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          role="log"
          aria-label="Conversation with Vivi"
          aria-busy={isLoading}
          className="bg-muted/70 min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-6 dark:bg-black/40"
        >
          {messages.length === 0 && !streamingContent && !isLoading && (
            <SuggestionChips
              onSelect={(text) => {
                sendMessage(text);
              }}
            />
          )}

          <MessageList messages={messages} />

          {isLoading &&
            (streamingContent ? (
              <StreamingAssistant content={streamingContent} />
            ) : (
              <ViviThinkingIndicator />
            ))}

          {error && <ErrorState onRetry={handleRetry} />}
        </div>

        <div
          className="bg-muted/70 shrink-0 px-4 sm:px-6 dark:bg-black/40"
          style={{ paddingBottom: footerPaddingBottom }}
        >
          <ChatInput
            ref={textareaRef}
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            disabled={isLoading}
            isLoading={isLoading}
            onStop={handleStop}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
