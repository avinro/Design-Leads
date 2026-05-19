"use client";

import { useState, useRef, useEffect } from "react";
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

interface Message {
  role: "user" | "assistant";
  content: string;
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="ml-auto flex max-w-[85%] gap-2">
        <div className="bg-primary text-primary-foreground flex-1 rounded-2xl rounded-br-none px-4 py-2.5">
          <p className="font-sans text-sm">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant message
  const clean = sanitizeHtml(message.content);
  return (
    <div className="prose-chat mr-auto max-w-[95%]">
      <div dangerouslySetInnerHTML={{ __html: clean }} />
    </div>
  );
}

function StreamingBubble({ content }: { content: string }) {
  return (
    <div className="prose-chat mr-auto max-w-[95%]">
      <p className="text-foreground/80 text-sm">
        {content}
        <span className="animate-pulse">▌</span>
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border-destructive/50 bg-destructive/10 mr-auto flex max-w-[95%] items-start gap-2 rounded-lg border p-3">
      <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
      <div className="flex-1">
        <p className="text-foreground/80 text-sm">Vivi had trouble responding. Please try again.</p>
        <button
          onClick={onRetry}
          className="text-accent text-xs underline underline-offset-2 hover:opacity-80"
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
          className="border-border bg-background/50 hover:bg-muted block w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
  isLoading,
  onStop,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  disabled: boolean;
  isLoading: boolean;
  onStop: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${String(Math.min(textarea.scrollHeight, 120))}px`;
  }, [value]);

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
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
          "border-border bg-muted flex-1 resize-none rounded-xl border",
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
            "size-9 shrink-0 rounded-full",
            "bg-destructive/20 text-destructive",
            "flex items-center justify-center",
            "transition-opacity duration-150 hover:opacity-80",
          )}
          aria-label="Stop message"
        >
          <Square className="size-3.5" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className={cn(
            "size-9 shrink-0 rounded-full",
            "bg-primary text-primary-foreground",
            "flex items-center justify-center",
            "disabled:cursor-not-allowed disabled:opacity-40",
            "transition-opacity duration-150",
          )}
          aria-label="Send message"
        >
          <ArrowUp className="size-4" />
        </button>
      )}
    </form>
  );
}

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lenis = useLenis();

  const sendMessage = async (text: string): Promise<void> => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setStreamingContent("");
    setError(null);
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
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
      let accumulated = "";

      let done = false;
      while (!done) {
        const { done: isDone, value } = await reader.read();
        done = isDone;
        if (value) {
          accumulated += decoder.decode(value, { stream: true });
          setStreamingContent(accumulated);
        }
      }

      // Stream complete
      setMessages([...nextMessages, { role: "assistant", content: accumulated }]);
      setStreamingContent("");
      track({ name: "ai_chat_message_sent", props: { messageCount: nextMessages.length + 1 } });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message || "Failed to get response");
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleStop = (): void => {
    abortRef.current?.abort();
  };

  // Scroll to bottom on new messages or streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Manage Lenis on sheet open/close
  useEffect(() => {
    if (!open || !lenis) return;
    lenis.stop();
    return () => {
      lenis.start();
      scheduleRefreshLenisBounds(lenis);
    };
  }, [open, lenis]);

  const handleOpenChange = (newOpen: boolean): void => {
    setOpen(newOpen);
    if (newOpen) {
      track({ name: "ai_chat_open", props: {} });
    }
  };

  const handleSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button
          className={cn(
            "fixed z-40",
            "right-4 bottom-24",
            "md:right-6 md:bottom-8",
            "bg-primary text-primary-foreground",
            "size-14 rounded-full",
            "flex items-center justify-center",
            "transition-all duration-200",
            "hover:scale-110 hover:shadow-lg",
            "active:scale-95",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
            "select-none",
          )}
          aria-haspopup="dialog"
          aria-label="Chat with Vivi about Ary's work"
        >
          <MessageCircleQuestion className="size-6" aria-hidden />
        </button>
      </SheetTrigger>

      <SheetContent className="flex flex-col">
        <SheetHeader
          className="shrink-0 px-6 pb-6"
          style={{ paddingTop: "max(env(safe-area-inset-top), 1.5rem)" }}
        >
          <SheetTitle>Chat with Vivi</SheetTitle>
          <SheetDescription>
            Ask about Ary&apos;s work, experience, and design expertise.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {messages.length === 0 && !streamingContent && (
            <SuggestionChips
              onSelect={(text) => {
                void sendMessage(text);
              }}
            />
          )}

          {messages.map((message, i) => (
            <MessageBubble key={i} message={message} />
          ))}

          {isLoading && streamingContent && <StreamingBubble content={streamingContent} />}

          {error && (
            <ErrorState
              onRetry={() => {
                setError(null);
              }}
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 px-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
          <ChatInput
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
