/** Session flag — intro completed for this tab session. */
export const INTRO_SEEN_SESSION_KEY = "avinro:intro-seen";

/** One-shot flag consumed by (site)/template.tsx to skip page-enter after intro. */
export const INTRO_JUST_COMPLETED_SESSION_KEY = "avinro:intro-just-completed";

/** Applied to <html> before first paint when the intro has not been seen this session. */
export const INTRO_PENDING_HTML_CLASS = "avinro-intro-pending";
