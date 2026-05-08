"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sendInvite, type InviteState } from "./actions";

interface Account {
  id: string;
  name: string;
}

interface Props {
  accounts: Account[];
}

const initialState: InviteState = { status: "idle" };

export function InviteForm({ accounts }: Props) {
  const [state, formAction, isPending] = useActionState(sendInvite, initialState);

  const singleAccount = accounts.length === 1 ? accounts[0] : null;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Invite a client</CardTitle>
        <CardDescription>
          Send a magic-link invitation to a client email. They will be added to the selected account
          once they accept.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {state.status === "success" && (
          <p
            role="status"
            className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300"
          >
            {state.message}
          </p>
        )}

        {state.status === "error" && !state.fieldErrors && (
          <p
            role="alert"
            className="bg-destructive/10 text-destructive mb-4 rounded-lg px-3 py-2 text-sm"
          >
            {state.message}
          </p>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          {/* If only one account exists, use it silently.
              Otherwise show a native select so the owner can pick. */}
          {singleAccount ? (
            <>
              <input type="hidden" name="accountId" value={singleAccount.id} />
              <p className="text-muted-foreground text-xs">
                Account: <span className="text-foreground font-medium">{singleAccount.name}</span>
              </p>
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="accountId">Account</Label>
              <select
                id="accountId"
                name="accountId"
                required
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
                aria-invalid={
                  state.status === "error" && !!state.fieldErrors?.accountId ? true : undefined
                }
              >
                <option value="">Select an account…</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              {state.status === "error" && state.fieldErrors?.accountId && (
                <p className="text-destructive text-xs">{state.fieldErrors.accountId[0]}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Client email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="client@company.com"
              aria-invalid={
                state.status === "error" && !!state.fieldErrors?.email ? true : undefined
              }
              aria-describedby={
                state.status === "error" && state.fieldErrors?.email
                  ? "invite-email-error"
                  : undefined
              }
            />
            {state.status === "error" && state.fieldErrors?.email && (
              <p id="invite-email-error" className="text-destructive text-xs">
                {state.fieldErrors.email[0]}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Sending invitation…" : "Send invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
