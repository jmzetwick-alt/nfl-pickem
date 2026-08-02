import { StandingsTable } from "@/components/StandingsTable";
import { PageShell, EmptyState } from "@/components/WeekPicksPage";
import {
  getActiveSeason,
  getAllGamesForSeason,
  getAllPicksForSeason,
  getAllProfiles,
  getCurrentUser,
} from "@/lib/queries";
import { computeStandings } from "@/lib/scoring";
import { redirect } from "next/navigation";

export default async function StandingsPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const season = await getActiveSeason();
  if (!season) {
    return (
      <PageShell title="Standings">
        <EmptyState message="No active season yet." />
      </PageShell>
    );
  }

  const [profiles, games, picks] = await Promise.all([
    getAllProfiles(),
    getAllGamesForSeason(season.id),
    getAllPicksForSeason(season.id),
  ]);

  const standings = computeStandings(profiles, games, picks);

  return (
    <PageShell title="Standings" subtitle={season.name}>
      <p className="mb-4 text-sm text-slate-500">
        Ranked by win percentage. Missing picks count as losses after lock.
      </p>
      <StandingsTable standings={standings} highlightUserId={profile.id} />
    </PageShell>
  );
}
