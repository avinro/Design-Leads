import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PendingFromYouCard } from "./pending-from-you-card";

// Stub EmptyState so tests don't depend on its internal markup.
import { vi } from "vitest";
vi.mock("@/components/client/empty-state", () => ({
  EmptyState: ({ title }: { title: string }) => <div data-testid="empty-state">{title}</div>,
}));

const makeDeliverable = (id: string, status: string) => ({
  id,
  title: `Deliverable ${id}`,
  status,
});

describe("PendingFromYouCard — no pending items", () => {
  it("renders the empty state when there are no pending deliverables and no intake form", () => {
    const html = renderToStaticMarkup(<PendingFromYouCard deliverables={[]} intakeForm={null} />);
    expect(html).toContain("Nothing pending");
  });

  it("does not show a badge count when empty", () => {
    const html = renderToStaticMarkup(<PendingFromYouCard deliverables={[]} intakeForm={null} />);
    // The count badge renders a number in a span; it should be absent.
    expect(html).not.toMatch(/>1</);
  });
});

describe("PendingFromYouCard — published deliverables", () => {
  it("shows published deliverables as pending items", () => {
    const html = renderToStaticMarkup(
      <PendingFromYouCard deliverables={[makeDeliverable("a", "published")]} intakeForm={null} />,
    );
    expect(html).toContain("Review: Deliverable a");
  });

  it("does not show draft deliverables as pending", () => {
    const html = renderToStaticMarkup(
      <PendingFromYouCard deliverables={[makeDeliverable("b", "draft")]} intakeForm={null} />,
    );
    expect(html).not.toContain("Review: Deliverable b");
    expect(html).toContain("Nothing pending");
  });

  it("does not show approved deliverables as pending", () => {
    const html = renderToStaticMarkup(
      <PendingFromYouCard deliverables={[makeDeliverable("c", "approved")]} intakeForm={null} />,
    );
    expect(html).not.toContain("Review: Deliverable c");
  });

  it("shows the count badge when there are pending items", () => {
    const html = renderToStaticMarkup(
      <PendingFromYouCard
        deliverables={[makeDeliverable("d", "published"), makeDeliverable("e", "published")]}
        intakeForm={null}
      />,
    );
    expect(html).toContain(">2<");
  });
});

describe("PendingFromYouCard — intake form", () => {
  it("shows intake form as pending when submitted_at is null and schema is filled", () => {
    const html = renderToStaticMarkup(
      <PendingFromYouCard
        deliverables={[]}
        intakeForm={{ id: "f1", submitted_at: null, hasFilled: true }}
      />,
    );
    expect(html).toContain("Project intake form not yet submitted");
  });

  it("does not show intake form when already submitted", () => {
    const html = renderToStaticMarkup(
      <PendingFromYouCard
        deliverables={[]}
        intakeForm={{ id: "f1", submitted_at: "2026-05-01T00:00:00Z", hasFilled: true }}
      />,
    );
    expect(html).not.toContain("Project intake form");
    expect(html).toContain("Nothing pending");
  });

  it("does not show intake form when schema is empty (hasFilled is false)", () => {
    const html = renderToStaticMarkup(
      <PendingFromYouCard
        deliverables={[]}
        intakeForm={{ id: "f1", submitted_at: null, hasFilled: false }}
      />,
    );
    expect(html).not.toContain("Project intake form");
  });
});
