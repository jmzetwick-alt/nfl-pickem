import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-57px)] max-w-sm flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">
          Welcome back to the pick&apos;em pool.
        </p>
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-slate-500">
          Need an account?{" "}
          <Link href="/signup" className="font-medium text-[var(--color-nfl-green)]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
