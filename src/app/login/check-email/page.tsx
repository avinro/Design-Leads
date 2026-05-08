import type { Metadata } from "next";
import Link from "next/link";

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
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Click the link in the email to sign in. The link expires in 1 hour.
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
