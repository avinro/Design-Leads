import { FileText, MessageSquare, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Quick links surface the three most common client actions as CTAs.
 *
 * All three targets (deliverable view, comments, contact) depend on features
 * not yet shipped (PRO-41 / PRO-42). They are rendered as disabled buttons
 * with a tooltip rather than hidden, so clients understand the intent and
 * we can enable them incrementally without a layout change.
 */
export function QuickLinksCard() {
  const links = [
    {
      id: "latest-deliverable",
      icon: <FileText className="size-4" aria-hidden="true" />,
      label: "Latest deliverable",
      tooltip: "Deliverable viewing comes in a future update (PRO-41)",
    },
    {
      id: "leave-feedback",
      icon: <MessageSquare className="size-4" aria-hidden="true" />,
      label: "Leave feedback",
      tooltip: "Comment threads come in a future update (PRO-42)",
    },
    {
      id: "contact-designer",
      icon: <Mail className="size-4" aria-hidden="true" />,
      label: "Contact designer",
      tooltip: "Direct messaging comes in a future update",
    },
  ] as const;

  return (
    <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
      <h2 className="text-foreground mb-4 text-sm font-semibold">Quick links</h2>

      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <Button
            key={link.id}
            variant="outline"
            size="sm"
            disabled
            className="w-full justify-start gap-2 opacity-60"
            title={link.tooltip}
            aria-disabled="true"
          >
            {link.icon}
            <span>{link.label}</span>
            <span className="ml-auto text-[10px] font-normal opacity-70">Coming soon</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
