import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, FolderOpen, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { phaseLabel } from "@/lib/projects/phases";
import { relativeTime } from "@/lib/format/relative-time";
import type { OwnerDashboardCard } from "@/lib/owner/dashboard-data";

interface ClientAccountCardProps {
  card: OwnerDashboardCard;
}

/**
 * Displays a single client account card on the owner dashboard.
 *
 * Shows: account name, primary project + phase badge, next milestone,
 * last activity, member count, and a "View details" link.
 *
 * Pure presentational — all data is pre-computed by the server loader.
 */
export function ClientAccountCard({ card }: ClientAccountCardProps) {
  const { account, primaryProject, extraProjectCount, nextMilestone, lastActivityAt, memberCount } =
    card;

  return (
    <Card className="flex flex-col">
      {/* Header: account name + filter bucket badge */}
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{account.name}</CardTitle>
          {card.filterBucket !== "none" && (
            <Badge
              variant={card.filterBucket === "active" ? "default" : "secondary"}
              className="shrink-0 capitalize"
            >
              {card.filterBucket}
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Body */}
      <CardContent className="flex flex-1 flex-col gap-4">
        {/* Primary project */}
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Active project
          </p>
          {primaryProject ? (
            <div className="flex items-center gap-2">
              <FolderOpen className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
              <span className="text-foreground min-w-0 truncate text-sm font-medium">
                {primaryProject.name}
              </span>
              <Badge variant="outline" className="ml-auto shrink-0 capitalize">
                {phaseLabel(primaryProject.current_phase)}
              </Badge>
              {extraProjectCount > 0 && (
                <span className="text-muted-foreground shrink-0 text-xs">+{extraProjectCount}</span>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">No projects yet</p>
          )}
        </div>

        {/* Next milestone */}
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Next milestone
          </p>
          {nextMilestone ? (
            <div className="flex items-start gap-2">
              <CalendarDays
                className="text-muted-foreground mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-foreground truncate text-sm font-medium">{nextMilestone.name}</p>
                {nextMilestone.due_at && (
                  <time dateTime={nextMilestone.due_at} className="text-muted-foreground text-xs">
                    {new Date(nextMilestone.due_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">No upcoming milestones</p>
          )}
        </div>
      </CardContent>

      {/* Footer: meta row + CTA */}
      <CardFooter className="flex items-center justify-between gap-3">
        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          {/* Member count */}
          <span className="flex items-center gap-1">
            <Users className="size-3.5" aria-hidden="true" />
            <span>
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </span>
          </span>

          {/* Last activity */}
          {lastActivityAt && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              <span>{relativeTime(lastActivityAt)}</span>
            </span>
          )}
        </div>

        <Button variant="ghost" size="sm" asChild className="shrink-0">
          <Link href={`/owner/clients/${account.id}`}>
            View details
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
