import type { Game, Week } from "@/lib/types";

export function pickCurrentWeek(weeks: Week[], games: Game[]): Week | null {
  if (weeks.length === 0) return null;

  const now = Date.now();
  const gamesByWeek = new Map<string, Game[]>();
  for (const game of games) {
    const list = gamesByWeek.get(game.week_id) ?? [];
    list.push(game);
    gamesByWeek.set(game.week_id, list);
  }

  // Prefer the week with the soonest upcoming kickoff that isn't fully locked
  let best: { week: Week; score: number } | null = null;

  for (const week of weeks) {
    const weekGames = gamesByWeek.get(week.id) ?? [];
    if (weekGames.length === 0) continue;

    const hasOpen = weekGames.some((g) => new Date(g.lock_time).getTime() > now);
    const earliestKickoff = Math.min(
      ...weekGames.map((g) => new Date(g.kickoff).getTime())
    );
    const latestKickoff = Math.max(
      ...weekGames.map((g) => new Date(g.kickoff).getTime())
    );

    // Open weeks rank higher; among those, pick soonest kickoff
    const score = hasOpen ? earliestKickoff : latestKickoff + 1e15;

    if (!best || score < best.score) {
      best = { week, score };
    }
  }

  return best?.week ?? weeks[weeks.length - 1] ?? weeks[0];
}
