import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { buildSystemPrompt } from "@/lib/ai/portfolio-context";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function sanitizeMessage(text: string): string {
  return text
    .replace(/<\/?system>/gi, "")
    .replace(/\[INST\]|\[\/INST\]/gi, "")
    .replace(/<<SYS>>|<\/SYS>>/gi, "");
}

export async function POST(req: Request): Promise<Response> {
  // Feature flag check
  if (process.env.NEXT_PUBLIC_AI_ENABLED !== "true") {
    return new Response("AI is disabled", { status: 403 });
  }

  // API key check
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response("Server misconfiguration: missing GEMINI_API_KEY", {
      status: 500,
    });
  }

  let body: Record<string, unknown> = {};
  try {
    const parsed = (await req.json()) as unknown;
    if (typeof parsed === "object" && parsed !== null) {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const rawMessages = Array.isArray(body.messages) ? (body.messages as unknown[]) : [];

  // Sanitize, validate, and truncate messages
  const safeMessages: ChatMessage[] = rawMessages
    .slice(-10) // Keep last 10 messages only
    .filter((m): m is ChatMessage => {
      if (!m || typeof m !== "object") return false;
      const msg = m as Record<string, unknown>;
      if (!("role" in msg) || !("content" in msg)) return false;
      if (typeof msg.role !== "string" || typeof msg.content !== "string") return false;
      return msg.role === "user" || msg.role === "assistant";
    })
    .map((m) => ({
      role: m.role,
      content: sanitizeMessage(m.content.slice(0, 1000)),
    }));

  // Validate: last message must be from user
  if (safeMessages.length === 0 || safeMessages[safeMessages.length - 1]?.role !== "user") {
    return new Response("Bad request: last message must be from user", {
      status: 400,
    });
  }

  try {
    const google = createGoogleGenerativeAI({ apiKey });

    const result = streamText({
      model: google("gemini-2.5-flash-lite"),
      system: buildSystemPrompt(),
      messages: safeMessages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
