"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sendMagicLink, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle" };

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const errorParam = searchParams.get("error");

  const [state, formAction, isPending] = useActionState(sendMagicLink, initialState);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send you a sign-in link.</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Expired / invalid link banner */}
        {errorParam === "link_invalid" && (
          <div
            role="alert"
            aria-live="polite"
            className="bg-destructive/10 text-destructive mb-4 flex items-start gap-2 rounded-lg px-3 py-2 text-sm"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>Your sign-in link has expired or is invalid. Please request a new one.</span>
          </div>
        )}

        {state.status === "error" && (
          <div
            role="alert"
            aria-live="polite"
            className="bg-destructive/10 text-destructive mb-4 flex items-start gap-2 rounded-lg px-3 py-2 text-sm"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{state.message}</span>
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          {/* Pass the return URL through the form so actions.ts can embed it
              in the emailRedirectTo URL. */}
          <input type="hidden" name="next" value={next} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              aria-invalid={
                state.status === "error" && !!state.fieldErrors?.email ? true : undefined
              }
              aria-describedby={
                state.status === "error" && state.fieldErrors?.email ? "email-error" : "email-hint"
              }
            />
            {state.status === "error" && state.fieldErrors?.email ? (
              <p id="email-error" className="text-destructive text-xs">
                {state.fieldErrors.email[0]}
              </p>
            ) : (
              <p id="email-hint" className="text-muted-foreground text-xs">
                Use the email your project owner invited.
              </p>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Sending…" : "Send sign-in link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
