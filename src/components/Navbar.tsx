import Link from "next/link";
import { getCurrentUser } from "@/lib/queries";
import { SignOutButton } from "./SignOutButton";

export async function Navbar() {
  const profile = await getCurrentUser();

  if (!profile) {
    return (
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold text-[var(--color-nfl-green)]">
            NFL Pick&apos;em
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-[var(--color-nfl-green)] shrink-0">
          NFL Pick&apos;em
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium sm:gap-3">
          <Link
            href="/"
            className="rounded-lg px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:px-3"
          >
            Picks
          </Link>
          <Link
            href="/standings"
            className="rounded-lg px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:px-3"
          >
            Standings
          </Link>
          {profile.is_admin && (
            <Link
              href="/admin"
              className="rounded-lg px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:px-3"
            >
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden text-sm text-slate-500 sm:inline">
            {profile.display_name}
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
