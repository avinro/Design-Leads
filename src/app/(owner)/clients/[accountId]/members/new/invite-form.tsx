"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type InviteState } from "./actions";

interface Props {
  accountId: string;
  accountName: string;
  // Bound server action: sendInvite.bind(null, accountId)
  action: (prevState: InviteState, formData: FormData) => Promise<InviteState>;
}

const initialState: InviteState = { status: "idle" };

/**
 * Invite-member form for a specific account.
 *
 * Unlike the legacy /owner/invite form, there is no account selector here —
 * the accountId is already known from the URL and bound into the server action.
 * The hidden `accountId` field is present only for form data completeness;
 * the server action does not trust it and validates it against the bound value.
 */
export function InviteMemberForm({ accountId, accountName, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Invite a member</CardTitle>
        <CardDescription>
          Send a magic-link invitation to a client email. They will be added to{" "}
          <span className="text-foreground font-medium">{accountName}</span> once they accept.
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
          {/* accountId is bound server-side; hidden field is for form data only. */}
          <input type="hidden" name="accountId" value={accountId} />

          <p className="text-muted-foreground text-xs">
            Account: <span className="text-foreground font-medium">{accountName}</span>
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Member email</Label>
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
