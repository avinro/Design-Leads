/**
 * Minimal three-dot “thinking” indicator for the Vivi chat assistant.
 * Animation is defined globally in `globals.css` (`.vivi-thinking-dot`).
 */
export function ViviThinkingIndicator() {
  return (
    <div
      className="mr-auto flex max-w-[95%] items-center gap-1.5 py-1"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Vivi is thinking</span>
      <span
        className="vivi-thinking-dot bg-foreground/40 size-1.5 shrink-0 rounded-full"
        aria-hidden
      />
      <span
        className="vivi-thinking-dot bg-foreground/40 size-1.5 shrink-0 rounded-full"
        aria-hidden
      />
      <span
        className="vivi-thinking-dot bg-foreground/40 size-1.5 shrink-0 rounded-full"
        aria-hidden
      />
    </div>
  );
}
