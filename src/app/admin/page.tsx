import { AdminGamesPanel } from "@/components/AdminGamesPanel";
import { AdminSeasonPanel } from "@/components/AdminSeasonPanel";
import { PageShell, EmptyState } from "@/components/WeekPicksPage";
import { createClient } from "@/lib/supabase/server";
import {
  getActiveSeason,
  getCurrentUser,
  getWeeks,
} from "@/lib/queries";
import type { Game, Season } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");
  if (!profile.is_admin) redirect("/");

  const supabase = await createClient();
  const { data: seasons } = await supabase
    .from("seasons")
    .select("*")
    .order("year", { ascending: false });

  const activeSeason = await getActiveSeason();
  const weeks = activeSeason ? await getWeeks(activeSeason.id) : [];

  let games: Game[] = [];
  if (activeSeason && weeks.length > 0) {
    const weekIds = weeks.map((w) => w.id);
    const { data } = await supabase
      .from("games")
      .select("*")
      .in("week_id", weekIds)
      .order("kickoff");
    games = (data ?? []) as Game[];
  }

  return (
    <PageShell title="Admin" subtitle="Manage seasons, weeks, games & scores">
      <div className="space-y-8">
        <AdminSeasonPanel
          seasons={(seasons ?? []) as Season[]}
          weeks={weeks}
          activeSeasonId={activeSeason?.id ?? null}
        />

        {activeSeason ? (
          <AdminGamesPanel weeks={weeks} games={games} />
        ) : (
          <EmptyState message="Create and activate a season to manage games." />
        )}
      </div>
    </PageShell>
  );
}
