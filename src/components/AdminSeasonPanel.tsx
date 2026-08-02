"use client";

import { useTransition } from "react";
import { createSeason, upsertWeek } from "@/lib/actions";
import type { Season, Week } from "@/lib/types";

type Props = {
  seasons: Season[];
  weeks: Week[];
  activeSeasonId: string | null;
};

export function AdminSeasonPanel({ seasons, weeks, activeSeasonId }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Seasons</h2>
        {seasons.length > 0 ? (
          <ul className="mb-4 space-y-1 text-sm text-slate-600">
            {seasons.map((s) => (
              <li key={s.id}>
                {s.name} {s.is_active && <span className="text-emerald-600">(active)</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-slate-400">No seasons yet.</p>
        )}
        <form
          action={(fd) => startTransition(async () => {
            const r = await createSeason(fd);
            if (r.error) alert(r.error);
          })}
          className="grid gap-3 sm:grid-cols-3"
        >
          <input
            name="year"
            type="number"
            required
            placeholder="2025"
            className="form-input"
          />
          <input
            name="name"
            type="text"
            required
            placeholder="2025 NFL Season"
            className="form-input"
          />
          <label className="flex items-center gap-2 text-sm">
            <input name="set_active" type="checkbox" defaultChecked className="rounded" />
            Set active
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="sm:col-span-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Create season
          </button>
        </form>
      </section>

      {activeSeasonId && (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Add week</h2>
          {weeks.length > 0 && (
            <p className="mb-3 text-sm text-slate-500">
              Existing: {weeks.map((w) => w.label).join(", ")}
            </p>
          )}
          <form
            action={(fd) => {
              fd.set("season_id", activeSeasonId);
              startTransition(async () => {
                const r = await upsertWeek(fd);
                if (r.error) alert(r.error);
              });
            }}
            className="grid gap-3 sm:grid-cols-3"
          >
            <input
              name="week_number"
              type="number"
              min="1"
              required
              placeholder="Week #"
              className="form-input"
            />
            <input
              name="label"
              type="text"
              required
              placeholder="Week 1"
              className="form-input"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Add week
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
