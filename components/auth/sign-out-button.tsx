"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full text-left px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
    >
      Sign Out
    </button>
  );
}
