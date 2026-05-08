import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Check your email",
  robots: { index: false },
};

interface Props {
  searchParams: Promise<{ email?: string }>;
}

export default async function CheckEmailPage({ searchParams }: Props) {
  const { email } = await searchParams;

  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center px-4 py-16"
    >
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mb-3 flex justify-center">
            <div className="bg-accent/10 flex size-12 items-center justify-center rounded-full">
              <MailCheck className="text-accent size-6" aria-hidden="true" />
            </div>
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            {email ? (
              <>
                We sent a sign-in link to <strong className="text-foreground">{email}</strong>.
              </>
            ) : (
              "A sign-in link has been sent to your email address."
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Click the link in the email to sign in. Usually arrives within 30 seconds.
          </p>
          <p className="text-muted-foreground text-xs">
            Don&apos;t see it? Check your spam folder.
          </p>
        </CardContent>

        <CardFooter className="justify-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Use a different email</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
