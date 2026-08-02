"use client";

import { signOut } from "@/lib/actions";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:text-sm"
    >
      Sign out
    </button>
  );
}
