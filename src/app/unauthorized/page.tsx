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
  title: "Access denied",
  robots: { index: false },
};

/**
 * /unauthorized — shown when an authenticated user tries to access a route
 * they do not have permission for (e.g. not an account member, not an owner).
 */
export default function UnauthorizedPage() {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center px-4 py-16"
    >
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>Access denied</CardTitle>
          <CardDescription>You don&apos;t have permission to view this page.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            If you believe this is a mistake, please contact the project owner to verify your
            access.
          </p>
        </CardContent>
        <CardFooter className="justify-center gap-2">
          <form action="/auth/signout" method="post">
            <Button variant="outline" size="sm" type="submit">
              Sign out
            </Button>
          </form>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
