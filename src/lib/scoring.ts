import type { Game, Pick, PickResult, PickSide, UserStanding } from "./types";

/**
 * Spread is stored from the home team's perspective.
 * Home -3.5 means home is favored by 3.5 points.
 * Home covers when: home_score + spread > away_score
 */
export function homeCoversSpread(
  homeScore: number,
  awayScore: number,
  spread: number
): "home" | "away" | "push" {
  const adjusted = homeScore + spread - awayScore;
  if (adjusted > 0) return "home";
  if (adjusted < 0) return "away";
  return "push";
}

export function formatSpread(spread: number, side: PickSide): string {
  const value = side === "home" ? spread : -spread;
  if (value === 0) return "PK";
  return value > 0 ? `+${value}` : `${value}`;
}

export function gradePick(game: Game, pick: Pick | null): PickResult {
  if (!pick) {
    const locked = new Date(game.lock_time) <= new Date();
    return locked ? "locked_no_pick" : "pending";
  }

  if (!game.is_final || game.home_score === null || game.away_score === null) {
    return "pending";
  }

  const cover = homeCoversSpread(game.home_score, game.away_score, game.spread);
  if (cover === "push") return "push";
  return pick.picked_side === cover ? "win" : "loss";
}

export function computeStandings(
  profiles: { id: string; display_name: string }[],
  games: Game[],
  picks: Pick[]
): UserStanding[] {
  const picksByUserGame = new Map<string, Pick>();
  for (const pick of picks) {
    picksByUserGame.set(`${pick.user_id}:${pick.game_id}`, pick);
  }

  const standings: UserStanding[] = profiles.map((profile) => {
    let wins = 0;
    let losses = 0;
    let pushes = 0;
    let pending = 0;

    for (const game of games) {
      const pick = picksByUserGame.get(`${profile.id}:${game.id}`) ?? null;
      const result = gradePick(game, pick);
      switch (result) {
        case "win":
          wins++;
          break;
        case "loss":
        case "locked_no_pick":
          losses++;
          break;
        case "push":
          pushes++;
          break;
        case "pending":
          pending++;
          break;
      }
    }

    const decided = wins + losses + pushes;
    const win_pct = decided > 0 ? wins / decided : 0;

    return {
      user_id: profile.id,
      display_name: profile.display_name,
      wins,
      losses,
      pushes,
      pending,
      win_pct,
    };
  });

  return standings.sort((a, b) => {
    if (b.win_pct !== a.win_pct) return b.win_pct - a.win_pct;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.display_name.localeCompare(b.display_name);
  });
}

export function resultLabel(result: PickResult): string {
  switch (result) {
    case "win":
      return "Win";
    case "loss":
      return "Loss";
    case "push":
      return "Push";
    case "pending":
      return "Pending";
    case "locked_no_pick":
      return "No pick";
  }
}

export function resultColor(result: PickResult): string {
  switch (result) {
    case "win":
      return "text-emerald-600 bg-emerald-50";
    case "loss":
    case "locked_no_pick":
      return "text-red-600 bg-red-50";
    case "push":
      return "text-amber-600 bg-amber-50";
    case "pending":
      return "text-slate-500 bg-slate-100";
  }
}
