"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

type SheetVariant = "default" | "chat";

function SheetOverlay({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay> & { variant?: SheetVariant }) {
  return (
    <DialogPrimitive.Overlay
      data-slot="sheet-overlay"
      data-variant={variant}
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50",
        "motion-reduce:transition-none motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none",
        variant === "default" && "bg-black/60 backdrop-blur-sm",
        variant === "chat" &&
          "bg-black/40 backdrop-blur-none supports-[backdrop-filter]:backdrop-blur-[2px] motion-reduce:supports-[backdrop-filter]:backdrop-blur-none",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  overlayClassName,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  overlayClassName?: string;
  variant?: SheetVariant;
}) {
  return (
    <SheetPortal>
      <SheetOverlay variant={variant} className={overlayClassName} />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        data-variant={variant}
        className={cn(
          // Position — right side, full viewport height
          "fixed inset-y-0 right-0 z-50 h-dvh w-full sm:max-w-[480px] lg:max-w-[560px]",
          // Surface
          "bg-background sm:border-border sm:border-l",
          variant === "chat" && "min-h-0 overflow-hidden sm:shadow-2xl",
          // Shape — square on mobile (full screen), rounded left edge on sm+
          "rounded-none sm:rounded-l-2xl",
          // Layout — flex column so the Calendly region can flex-1
          "flex flex-col",
          // Slide in/out from the right
          "data-[state=open]:animate-in data-[state=open]:slide-in-from-right",
          "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right",
          "motion-reduce:transition-none motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none",
          // Timing — enter 300ms, exit 200ms for responsiveness
          "data-[state=closed]:duration-200 data-[state=open]:duration-300",
          "ease-out focus:outline-none",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          data-slot="sheet-close"
          className={cn(
            "focus-ring absolute flex min-h-11 min-w-11 items-center justify-center rounded-full opacity-60 transition-opacity hover:opacity-100 disabled:pointer-events-none",
            "top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))]",
          )}
          aria-label="Close"
        >
          <X className="h-5 w-5 shrink-0" aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="sheet-header" className={cn("flex flex-col gap-2", className)} {...props} />
  );
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sheet-footer" className={cn("flex flex-col", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "font-display text-foreground text-3xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
