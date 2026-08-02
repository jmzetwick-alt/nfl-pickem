"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/actions";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (mode === "signup") {
      const displayName = form.get("display_name") as string;
      const inviteCode = form.get("invite_code") as string;
      const result = await signUp(email, password, displayName, inviteCode);
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
    } else {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "signup" && (
        <>
          <Field label="Display name" name="display_name" required />
          <Field label="Invite code" name="invite_code" required />
        </>
      )}
      <Field label="Email" name="email" type="email" required />
      <Field label="Password" name="password" type="password" required minLength={6} />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--color-nfl-green)] py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[var(--color-nfl-green)] focus:outline-none focus:ring-1 focus:ring-[var(--color-nfl-green)]"
      />
    </div>
  );
}
