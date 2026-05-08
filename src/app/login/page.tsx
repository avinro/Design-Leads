import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center px-4 py-16"
    >
      {/* Brand mark */}
      <div className="mb-8 text-center">
        <p className="text-foreground text-2xl font-bold tracking-tight">Avinro</p>
        <p className="text-muted-foreground mt-1 text-sm">Client Portal</p>
      </div>

      <Suspense>
        <LoginForm />
      </Suspense>

      <p className="text-muted-foreground mt-8 text-center text-xs">
        Don&apos;t have access?{" "}
        <span className="text-foreground font-medium">Contact the person who invited you.</span>
      </p>
    </main>
  );
}
