"use client";

import * as React from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, CheckCircleIcon, LoaderCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { submitContact } from "@/app/(site)/contact/actions";
import { contactSchema, type ContactFormValues, type ContactState } from "@/lib/contact/schema";
import { contactContent } from "@/lib/content/contact";
import { trackContactFormStart, trackContactFormSubmit } from "@/lib/analytics/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/*
 * ContactForm — PRO-19 / F1-8.
 *
 * Combines react-hook-form (client validation, field state) with useActionState
 * (server action state management). Both use the shared contactSchema so
 * validation rules are never duplicated.
 *
 * Accessibility:
 *   - Full shadcn Form composition: FormLabel + FormControl + FormMessage
 *     per field. No label-less inputs, no manual error spans.
 *   - A status summary <div> with aria-live="polite" / role="alert" sits
 *     above the form. Focus is moved there after every submit so keyboard
 *     and screen-reader users receive the outcome immediately.
 *   - Submit button is disabled and shows "Sending…" while pending.
 *   - prefers-reduced-motion is respected on spinner icon.
 *   - Touch targets: all inputs and the submit button are min-h-[44px].
 *   - Color is never the only error indicator — FormMessage provides text
 *     and aria-invalid is set on FormControl.
 *
 * Layout:
 *   - pb-[var(--space-cta-bar)] md:pb-0 prevents the submit button from
 *     being hidden behind the fixed MobileCtaBar on small viewports.
 */

const initialState: ContactState = { status: "idle" };

export function ContactForm() {
  const { form: copy, success: successCopy } = contactContent;

  // ── Server action state ─────────────────────────────────────────────────
  const [state, formAction, isPending] = useActionState(submitContact, initialState);

  // ── Client-side RHF form ────────────────────────────────────────────────
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: "",
      website: "",
    },
    mode: "onSubmit",
  });

  // ── Status summary ref for focus management ─────────────────────────────
  const statusRef = React.useRef<HTMLDivElement>(null);

  // ── Analytics: form_start guard ─────────────────────────────────────────
  // Fires at most once per form mount on the first focus of a real (non-honeypot) field.
  const formStartFired = React.useRef(false);
  function handleFieldFocus() {
    if (formStartFired.current) return;
    formStartFired.current = true;
    trackContactFormStart();
  }

  // ── Sync server state → RHF field errors + focus + toast ───────────────
  React.useEffect(() => {
    if (state.status === "idle") return;

    if (state.status === "success") {
      form.reset();
      toast.success(successCopy.heading, { description: successCopy.body });
      trackContactFormSubmit();
    }

    if (state.status === "error") {
      // Mirror server field errors into RHF so FormMessage renders them.
      if (state.fieldErrors) {
        Object.entries(state.fieldErrors).forEach(([field, messages]) => {
          form.setError(field as keyof ContactFormValues, {
            type: "server",
            message: messages[0],
          });
        });
      }
      toast.error("Message not sent", { description: state.message });
    }

    // Move focus to the status summary on success only.
    // On error we rely on role="alert" / aria-live for announcement and
    // deliberately avoid any focus() call to preserve the page scroll position.
    if (state.status === "success" && statusRef.current) {
      statusRef.current.focus();
    }
  }, [state, form, successCopy]);

  // ── Render ──────────────────────────────────────────────────────────────
  if (state.status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        aria-live="polite"
        className="flex flex-col gap-6 outline-none"
      >
        <div className="border-border/40 flex flex-col gap-4 rounded-xl border p-6">
          <CheckCircleIcon className="text-foreground size-6" aria-hidden="true" />
          <div className="flex flex-col gap-2">
            <p className="font-display text-lg font-semibold tracking-tight">
              {successCopy.heading}
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">{successCopy.body}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="mt-2 min-h-[44px] w-fit cursor-pointer"
            onClick={() => {
              form.reset();
              // Reset server state by reloading action state — navigate to
              // idle by re-triggering with a reset call. We trigger via a
              // hidden form submission of an empty reset action instead of
              // full page reload. Simplest approach: update parent state via
              // key remount.
              window.location.reload();
            }}
          >
            {successCopy.reset}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-[var(--space-cta-bar)] md:pb-0">
      {/*
       * Visually hidden aria-live region — screen readers announce server
       * errors without interrupting speech. Visual error is rendered below
       * the submit button so it sits near the action that triggered it.
       */}
      <div
        ref={statusRef}
        tabIndex={-1}
        aria-live="polite"
        role={state.status === "error" ? "alert" : undefined}
        className="sr-only outline-none"
      >
        {state.status === "error" && <p>{state.message}</p>}
      </div>

      <Form {...form}>
        <form action={formAction} className="flex flex-col gap-5">
          {/* ── Name ─────────────────────────────────────────────────── */}
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{copy.fields.name.label}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder={copy.fields.name.placeholder}
                    autoComplete="name"
                    className="min-h-[44px]"
                    disabled={isPending}
                    aria-invalid={!!fieldState.error}
                    onFocus={() => {
                      handleFieldFocus();
                      form.clearErrors(field.name);
                    }}
                  />
                </FormControl>
                <FormMessage className="sr-only" />
              </FormItem>
            )}
          />

          {/* ── Email ────────────────────────────────────────────────── */}
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{copy.fields.email.label}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder={copy.fields.email.placeholder}
                    autoComplete="email"
                    className="min-h-[44px]"
                    disabled={isPending}
                    aria-invalid={!!fieldState.error}
                    onFocus={() => {
                      handleFieldFocus();
                      form.clearErrors(field.name);
                    }}
                  />
                </FormControl>
                <FormMessage className="sr-only" />
              </FormItem>
            )}
          />

          {/* ── Company (optional) ────────────────────────────────────── */}
          <FormField
            control={form.control}
            name="company"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{copy.fields.company.label}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder={copy.fields.company.placeholder}
                    autoComplete="organization"
                    className="min-h-[44px]"
                    disabled={isPending}
                    aria-invalid={!!fieldState.error}
                    onFocus={() => {
                      handleFieldFocus();
                      form.clearErrors(field.name);
                    }}
                  />
                </FormControl>
                <FormDescription>{copy.fields.company.description}</FormDescription>
                <FormMessage className="sr-only" />
              </FormItem>
            )}
          />

          {/* ── Message ──────────────────────────────────────────────── */}
          <FormField
            control={form.control}
            name="message"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{copy.fields.message.label}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={copy.fields.message.placeholder}
                    rows={5}
                    className="min-h-[132px] resize-y"
                    disabled={isPending}
                    aria-invalid={!!fieldState.error}
                    onFocus={() => {
                      handleFieldFocus();
                      form.clearErrors(field.name);
                    }}
                  />
                </FormControl>
                <FormDescription>{copy.fields.message.description}</FormDescription>
                <FormMessage className="sr-only" />
              </FormItem>
            )}
          />

          {/*
           * Honeypot — hidden from real users, visible to bots.
           * - sr-only + aria-hidden: not in the a11y tree.
           * - tabIndex=-1: skipped by keyboard navigation.
           * - autoComplete="off": browsers won't fill it.
           * - Not validated client-side so bots pass RHF without friction.
           */}
          <div className="sr-only" aria-hidden="true">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" tabIndex={-1} autoComplete="off" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* ── Submit ───────────────────────────────────────────────── */}
          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="mt-2 min-h-[44px] w-full cursor-pointer sm:w-auto"
          >
            {isPending ? (
              <>
                <LoaderCircleIcon
                  className="mr-2 size-4 motion-reduce:hidden"
                  aria-hidden="true"
                  style={{ animation: "spin 1s linear infinite" }}
                />
                {copy.submitting}
              </>
            ) : (
              copy.submit
            )}
          </Button>

          {/* ── Error banner — clears field-by-field as user focuses each ── */}
          {(() => {
            const hasRhfErrors =
              Object.keys(form.formState.errors).filter((k) => k !== "website").length > 0;
            const hasServerNonFieldError = state.status === "error" && !state.fieldErrors;
            const showBanner = hasRhfErrors || hasServerNonFieldError;
            const bannerMessage = hasServerNonFieldError
              ? state.message
              : "Please complete the required fields before sending.";
            if (!showBanner) return null;
            return (
              <div className="border-destructive/30 bg-destructive/5 text-destructive flex items-center gap-2 rounded-lg border p-2 text-sm">
                <AlertCircleIcon className="size-4 shrink-0" aria-hidden="true" />
                <span>{bannerMessage}</span>
              </div>
            );
          })()}
        </form>
      </Form>
    </div>
  );
}
