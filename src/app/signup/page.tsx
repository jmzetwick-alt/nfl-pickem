import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-57px)] max-w-sm flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Create account</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">
          Private pool — invite code required.
        </p>
        <AuthForm mode="signup" />
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--color-nfl-green)]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
