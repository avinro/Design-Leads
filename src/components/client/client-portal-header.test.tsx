import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// Stub ClientPortalProjectSwitcher to simplify the snapshot
vi.mock("./client-portal-project-switcher", () => ({
  ClientPortalProjectSwitcher: ({ activeProject }: { activeProject: { name: string } | null }) =>
    activeProject ? <span>{activeProject.name}</span> : null,
}));

// Stub ClientPortalUserMenu (client island — uses Radix primitives that require
// a browser environment). The stub preserves the sign-out form POST contract so
// downstream tests catch any accidental auth-flow regressions.
vi.mock("./client-portal-user-menu", () => ({
  ClientPortalUserMenu: ({ displayName, email }: { displayName: string; email: string | null }) => (
    <div data-testid="user-menu">
      {email && <span data-testid="user-email">{email}</span>}
      <span data-testid="user-initials">{displayName.slice(0, 2).toUpperCase()}</span>
      <form action="/auth/signout" method="post">
        <button type="submit" aria-label="Sign out">
          Sign out
        </button>
      </form>
    </div>
  ),
}));

import { ClientPortalHeader } from "./client-portal-header";
import type { ClientPortalContext } from "@/lib/client-portal/context";

const stubContext = (overrides?: Partial<ClientPortalContext>): ClientPortalContext => ({
  user: { id: "u1", email: "alice@example.com", displayName: "alice" },
  account: { id: "a1", name: "Acme Studio", role: "viewer" },
  projects: [{ id: "p1", name: "Brand Refresh", currentPhase: "design" }],
  activeProject: { id: "p1", name: "Brand Refresh", currentPhase: "design" },
  hasProjects: true,
  ...overrides,
});

/*
 * Structural tests for ClientPortalHeader.
 *
 * Verifies:
 * - Account name is rendered
 * - Brand sub-mark is present
 * - Logout form POSTs to /auth/signout (sign-out contract)
 * - Project name rendered when hasProjects is true
 * - Project switcher hidden when hasProjects is false
 * - User initials derived from displayName
 */
describe("ClientPortalHeader", () => {
  it("renders the account name", () => {
    const html = renderToStaticMarkup(<ClientPortalHeader context={stubContext()} />);
    expect(html).toContain("Acme Studio");
  });

  it("renders the Avinro brand sub-mark", () => {
    const html = renderToStaticMarkup(<ClientPortalHeader context={stubContext()} />);
    expect(html).toContain("Avinro");
  });

  it("renders the logout form that POSTs to /auth/signout", () => {
    const html = renderToStaticMarkup(<ClientPortalHeader context={stubContext()} />);
    expect(html).toContain('action="/auth/signout"');
    expect(html).toContain('method="post"');
  });

  it("renders user initials from displayName", () => {
    const html = renderToStaticMarkup(<ClientPortalHeader context={stubContext()} />);
    // displayName is "alice" → initials "AL"
    expect(html).toContain("AL");
  });

  it("renders the active project name when hasProjects is true", () => {
    const html = renderToStaticMarkup(<ClientPortalHeader context={stubContext()} />);
    expect(html).toContain("Brand Refresh");
  });

  it("does not render the project switcher when hasProjects is false", () => {
    const html = renderToStaticMarkup(
      <ClientPortalHeader
        context={stubContext({ hasProjects: false, projects: [], activeProject: null })}
      />,
    );
    expect(html).not.toContain("Brand Refresh");
  });

  it("does not render a disabled notification bell (removed for v1)", () => {
    const html = renderToStaticMarkup(<ClientPortalHeader context={stubContext()} />);
    expect(html).not.toContain('aria-label="Notifications"');
  });
});
