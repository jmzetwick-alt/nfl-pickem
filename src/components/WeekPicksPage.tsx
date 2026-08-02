import { GameCard } from "@/components/GameCard";
import { WeekSelector } from "@/components/WeekSelector";
import {
  getActiveSeason,
  getCurrentUser,
  getGamesForWeek,
  getUserPicksForWeek,
  getWeekByNumber,
  getWeeks,
  getAllGamesForSeason,
} from "@/lib/queries";
import { pickCurrentWeek } from "@/lib/weeks";
import { redirect } from "next/navigation";

type Props = {
  weekNumber?: number;
};

export async function WeekPicksPage({ weekNumber }: Props) {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const season = await getActiveSeason();
  if (!season) {
    return (
      <PageShell title="NFL Pick'em">
        <EmptyState message="No active season yet. Ask an admin to set one up." />
      </PageShell>
    );
  }

  const weeks = await getWeeks(season.id);
  const allGames = await getAllGamesForSeason(season.id);
  const currentWeek = weekNumber
    ? await getWeekByNumber(season.id, weekNumber)
    : pickCurrentWeek(weeks, allGames);

  if (!currentWeek) {
    return (
      <PageShell title={season.name}>
        <EmptyState message="No weeks configured yet." />
      </PageShell>
    );
  }

  const games = await getGamesForWeek(currentWeek.id);
  const picks = await getUserPicksForWeek(
    profile.id,
    games.map((g) => g.id)
  );
  const picksByGame = new Map(picks.map((p) => [p.game_id, p]));

  const pickedCount = picks.length;
  const openCount = games.filter(
    (g) => new Date(g.lock_time) > new Date()
  ).length;

  return (
    <PageShell title={season.name} subtitle={currentWeek.label}>
      <WeekSelector
        weeks={weeks}
        currentWeekNumber={currentWeek.week_number}
        basePath={weekNumber === undefined ? "/" : "/week"}
      />

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          {pickedCount}/{games.length} picks made
        </span>
        {openCount > 0 && (
          <span>{openCount} game{openCount !== 1 ? "s" : ""} open</span>
        )}
      </div>

      {games.length === 0 ? (
        <EmptyState message="No games scheduled for this week." className="mt-6" />
      ) : (
        <div className="mt-4 space-y-3">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              pick={picksByGame.get(game.id) ?? null}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}

export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm font-medium text-slate-500">{subtitle}</p>
        )}
      </header>
      {children}
    </div>
  );
}

export function EmptyState({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500 ${className ?? ""}`}
    >
      {message}
    </div>
  );
}
