import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RecentActivityCard } from "./recent-activity-card";

import { vi } from "vitest";
vi.mock("@/components/client/empty-state", () => ({
  EmptyState: ({ title }: { title: string }) => <div data-testid="empty-state">{title}</div>,
}));

const NOW = new Date("2026-05-09T10:00:00.000Z").getTime();
const ts = (offsetMs: number) => new Date(NOW - offsetMs).toISOString();

const makeDeliverable = (id: string, uploadedAt: string | null, createdAt: string) => ({
  id,
  title: `File ${id}`,
  uploaded_at: uploadedAt,
  created_at: createdAt,
});

const makeComment = (id: string, createdAt: string, body = "A comment") => ({
  id,
  body,
  created_at: createdAt,
});

const makeMilestone = (id: string, status: string, updatedAt: string, name = `M${id}`) => ({
  id,
  name,
  status,
  updated_at: updatedAt,
});

describe("RecentActivityCard — empty state", () => {
  it("renders empty state when all feeds are empty", () => {
    const html = renderToStaticMarkup(
      <RecentActivityCard deliverables={[]} comments={[]} milestones={[]} now={NOW} />,
    );
    expect(html).toContain("No recent activity");
  });
});

describe("RecentActivityCard — relative timestamps", () => {
  it("shows 'just now' for an event 30 seconds ago", () => {
    const html = renderToStaticMarkup(
      <RecentActivityCard
        deliverables={[makeDeliverable("a", ts(30_000), ts(30_000))]}
        comments={[]}
        milestones={[]}
        now={NOW}
      />,
    );
    expect(html).toContain("just now");
  });

  it("shows '1m ago' for an event 65 seconds ago", () => {
    const html = renderToStaticMarkup(
      <RecentActivityCard
        deliverables={[makeDeliverable("b", ts(65_000), ts(65_000))]}
        comments={[]}
        milestones={[]}
        now={NOW}
      />,
    );
    expect(html).toContain("1m ago");
  });
});

describe("RecentActivityCard — merge order", () => {
  it("sorts events newest-first across types", () => {
    const html = renderToStaticMarkup(
      <RecentActivityCard
        deliverables={[makeDeliverable("old", ts(10 * 60_000), ts(10 * 60_000))]}
        comments={[makeComment("recent", ts(60_000))]}
        milestones={[]}
        now={NOW}
      />,
    );
    // The comment (1m ago) must appear before the deliverable (10m ago).
    const commentPos = html.indexOf("A comment");
    const deliverablePos = html.indexOf("File old");
    expect(commentPos).toBeLessThan(deliverablePos);
  });

  it("caps the feed at 5 items", () => {
    const deliverables = Array.from({ length: 6 }, (_, i) =>
      makeDeliverable(String(i), ts((i + 1) * 60_000), ts((i + 1) * 60_000)),
    );
    const html = renderToStaticMarkup(
      <RecentActivityCard deliverables={deliverables} comments={[]} milestones={[]} now={NOW} />,
    );
    // File 0 through File 4 should be present, File 5 (oldest) should not.
    expect(html).toContain("File 0");
    expect(html).toContain("File 4");
    expect(html).not.toContain("File 5");
  });
});

describe("RecentActivityCard — milestone filter", () => {
  it("includes 'done' milestones in the feed", () => {
    const html = renderToStaticMarkup(
      <RecentActivityCard
        deliverables={[]}
        comments={[]}
        milestones={[makeMilestone("m1", "done", ts(5 * 60_000), "Launch")]}
        now={NOW}
      />,
    );
    expect(html).toContain("Launch");
  });

  it("excludes non-done milestones from the feed", () => {
    const html = renderToStaticMarkup(
      <RecentActivityCard
        deliverables={[]}
        comments={[]}
        milestones={[makeMilestone("m2", "in_progress", ts(60_000), "WIP")]}
        now={NOW}
      />,
    );
    expect(html).not.toContain("WIP");
    expect(html).toContain("No recent activity");
  });
});
