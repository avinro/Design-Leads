"use client";

import { Settings, LogOut } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClientPortalUserMenuProps {
  displayName: string;
  email: string | null;
}

/**
 * Client island: user avatar + dropdown menu for the portal header.
 *
 * Isolated as a small client component so the parent ClientPortalHeader
 * stays server-rendered. Contains no auth logic — logout is a native
 * form POST to /auth/signout to avoid importing any server-side auth code.
 *
 * Initials derive from the first two chars of displayName, uppercased.
 */
export function ClientPortalUserMenu({ displayName, email }: ClientPortalUserMenuProps) {
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="User menu"
          className="focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Avatar size="sm" className="cursor-pointer">
            <AvatarFallback className="bg-accent/15 text-accent text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        {email && (
          <>
            <DropdownMenuLabel className="text-muted-foreground truncate text-xs font-normal">
              {email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem asChild>
          <Link href="/client/settings" className="cursor-pointer">
            <Settings aria-hidden="true" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Native form POST — no client-side auth import needed */}
        <form action="/auth/signout" method="post">
          <DropdownMenuItem asChild>
            <button type="submit" aria-label="Sign out" className="w-full cursor-pointer text-left">
              <LogOut aria-hidden="true" />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
