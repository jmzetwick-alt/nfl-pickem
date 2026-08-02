"use client";

import { useTransition } from "react";
import { submitPick } from "@/lib/actions";
import { gradePick, formatSpread, resultColor, resultLabel } from "@/lib/scoring";
import type { Game, Pick, PickSide } from "@/lib/types";
import { cn, formatKickoff, isGameLocked } from "@/lib/utils";

type Props = {
  game: Game;
  pick: Pick | null;
};

export function GameCard({ game, pick }: Props) {
  const [isPending, startTransition] = useTransition();
  const locked = isGameLocked(game.lock_time);
  const result = gradePick(game, pick);

  function handlePick(side: PickSide) {
    if (locked || isPending) return;
    startTransition(async () => {
      await submitPick(game.id, side);
    });
  }

  const showScore =
    game.is_final && game.home_score !== null && game.away_score !== null;

  return (
    <article
      className={cn(
        "rounded-xl border bg-white p-4 shadow-sm transition-shadow",
        locked && !pick ? "border-amber-200" : "border-slate-200"
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">
          {formatKickoff(game.kickoff)}
        </p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            resultColor(result)
          )}
        >
          {resultLabel(result)}
        </span>
      </div>

      <div className="space-y-2">
        <TeamRow
          team={game.away_team}
          spread={formatSpread(game.spread, "away")}
          score={showScore ? game.away_score! : null}
          selected={pick?.picked_side === "away"}
          disabled={locked || isPending}
          onSelect={() => handlePick("away")}
        />
        <TeamRow
          team={game.home_team}
          spread={formatSpread(game.spread, "home")}
          score={showScore ? game.home_score! : null}
          selected={pick?.picked_side === "home"}
          disabled={locked || isPending}
          onSelect={() => handlePick("home")}
          isHome
        />
      </div>

      {locked && !pick && (
        <p className="mt-3 text-xs text-amber-600">Locked — no pick submitted</p>
      )}
      {!locked && (
        <p className="mt-3 text-xs text-slate-400">
          Tap a team to pick. Changes allowed until lock.
        </p>
      )}
    </article>
  );
}

function TeamRow({
  team,
  spread,
  score,
  selected,
  disabled,
  onSelect,
  isHome,
}: {
  team: string;
  spread: string;
  score: number | null;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  isHome?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors",
        selected
          ? "border-[var(--color-nfl-green)] bg-blue-50 ring-1 ring-[var(--color-nfl-green)]"
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
        disabled && !selected && "cursor-default opacity-70 hover:bg-white hover:border-slate-200"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {isHome && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Home
          </span>
        )}
        <span className="truncate font-semibold text-slate-900">{team}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-2">
        {score !== null && (
          <span className="text-lg font-bold tabular-nums text-slate-900">
            {score}
          </span>
        )}
        <span className="w-12 text-right text-sm font-medium tabular-nums text-slate-500">
          {spread}
        </span>
      </div>
    </button>
  );
}
