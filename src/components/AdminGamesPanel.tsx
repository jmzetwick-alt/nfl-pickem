"use client";

import { useState, useTransition } from "react";
import { deleteGame, upsertGame } from "@/lib/actions";
import type { Game, Week } from "@/lib/types";
import { formatKickoff } from "@/lib/utils";

type Props = {
  weeks: Week[];
  games: Game[];
};

export function AdminGamesPanel({ weeks, games }: Props) {
  const [editing, setEditing] = useState<Game | "new" | null>(null);
  const [isPending, startTransition] = useTransition();

  const gamesByWeek = weeks.map((week) => ({
    week,
    games: games.filter((g) => g.week_id === week.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Games</h2>
        <button
          onClick={() => setEditing("new")}
          className="rounded-lg bg-[var(--color-nfl-green)] px-4 py-2 text-sm font-semibold text-white"
        >
          Add game
        </button>
      </div>

      {editing !== null && (
        <GameForm
          weeks={weeks}
          game={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          isPending={isPending}
        />
      )}

      {gamesByWeek.map(({ week, games: weekGames }) => (
        <section key={week.id}>
          <h3 className="mb-2 text-sm font-semibold text-slate-500 uppercase tracking-wide">
            {week.label}
          </h3>
          {weekGames.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">No games yet.</p>
          ) : (
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {weekGames.map((game) => (
                <li
                  key={game.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {game.away_team} @ {game.home_team}
                    </p>
                    <p className="text-xs text-slate-500">
                      Spread {game.spread} · {formatKickoff(game.kickoff)}
                      {game.is_final &&
                        ` · Final ${game.away_score}-${game.home_score}`}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setEditing(game)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        startTransition(async () => {
                          if (confirm("Delete this game?")) {
                            await deleteGame(game.id);
                          }
                        })
                      }
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

function GameForm({
  weeks,
  game,
  onClose,
  isPending,
}: {
  weeks: Week[];
  game: Game | null;
  onClose: () => void;
  isPending: boolean;
}) {
  const defaultWeek = game?.week_id ?? weeks[0]?.id ?? "";

  function toLocalDatetime(iso: string | undefined): string {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-900">
        {game ? "Edit game" : "New game"}
      </h3>
      <form
        action={async (formData) => {
          const result = await upsertGame(formData);
          if (!result.error) onClose();
          else alert(result.error);
        }}
        className="space-y-3"
      >
        {game && <input type="hidden" name="id" value={game.id} />}

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Week">
            <select
              name="week_id"
              defaultValue={defaultWeek}
              required
              className="form-input"
            >
              {weeks.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Spread (home perspective)">
            <input
              name="spread"
              type="number"
              step="0.5"
              defaultValue={game?.spread ?? 0}
              required
              className="form-input"
              placeholder="-3.5"
            />
          </FormField>
          <FormField label="Away team">
            <input
              name="away_team"
              defaultValue={game?.away_team ?? ""}
              required
              className="form-input"
              placeholder="Kansas City Chiefs"
            />
          </FormField>
          <FormField label="Home team">
            <input
              name="home_team"
              defaultValue={game?.home_team ?? ""}
              required
              className="form-input"
              placeholder="Buffalo Bills"
            />
          </FormField>
          <FormField label="Kickoff">
            <input
              name="kickoff"
              type="datetime-local"
              defaultValue={toLocalDatetime(game?.kickoff)}
              required
              className="form-input"
            />
          </FormField>
          <FormField label="Lock time (defaults to kickoff)">
            <input
              name="lock_time"
              type="datetime-local"
              defaultValue={toLocalDatetime(game?.lock_time)}
              className="form-input"
            />
          </FormField>
          <FormField label="Away score">
            <input
              name="away_score"
              type="number"
              min="0"
              defaultValue={game?.away_score ?? ""}
              className="form-input"
            />
          </FormField>
          <FormField label="Home score">
            <input
              name="home_score"
              type="number"
              min="0"
              defaultValue={game?.home_score ?? ""}
              className="form-input"
            />
          </FormField>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            name="is_final"
            type="checkbox"
            defaultChecked={game?.is_final ?? false}
            className="rounded border-slate-300"
          />
          Mark as final
        </label>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[var(--color-nfl-green)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      {children}
    </div>
  );
}
