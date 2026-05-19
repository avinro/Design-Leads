"use client";

import dynamic from "next/dynamic";

const AiChat = dynamic(() => import("@/components/site/ai-chat").then((m) => m.AiChat), {
  ssr: false,
});

export function AiChatLoader() {
  if (process.env.NEXT_PUBLIC_AI_ENABLED !== "true") {
    return null;
  }
  return <AiChat />;
}
