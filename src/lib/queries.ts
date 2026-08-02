import { createClient } from "@/lib/supabase/server";
import type { Game, Pick, Profile, Season, Week } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as Profile | null;
}

export async function getActiveSeason(): Promise<Season | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();
  return data as Season | null;
}

export async function getWeeks(seasonId: string): Promise<Week[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("weeks")
    .select("*")
    .eq("season_id", seasonId)
    .order("week_number");
  return (data ?? []) as Week[];
}

export async function getWeekByNumber(
  seasonId: string,
  weekNumber: number
): Promise<Week | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("weeks")
    .select("*")
    .eq("season_id", seasonId)
    .eq("week_number", weekNumber)
    .maybeSingle();
  return data as Week | null;
}

export async function getGamesForWeek(weekId: string): Promise<Game[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("games")
    .select("*")
    .eq("week_id", weekId)
    .order("kickoff");
  return (data ?? []) as Game[];
}

export async function getUserPicksForWeek(
  userId: string,
  gameIds: string[]
): Promise<Pick[]> {
  if (gameIds.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("picks")
    .select("*")
    .eq("user_id", userId)
    .in("game_id", gameIds);
  return (data ?? []) as Pick[];
}

export async function getAllPicksForGames(gameIds: string[]): Promise<Pick[]> {
  if (gameIds.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("picks")
    .select("*")
    .in("game_id", gameIds);
  return (data ?? []) as Pick[];
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("display_name");
  return (data ?? []) as Profile[];
}

export async function getAllGamesForSeason(seasonId: string): Promise<Game[]> {
  const supabase = await createClient();
  const { data: weeks } = await supabase
    .from("weeks")
    .select("id")
    .eq("season_id", seasonId);

  if (!weeks?.length) return [];

  const weekIds = weeks.map((w) => w.id);
  const { data } = await supabase
    .from("games")
    .select("*")
    .in("week_id", weekIds)
    .order("kickoff");
  return (data ?? []) as Game[];
}

export async function getAllPicksForSeason(seasonId: string): Promise<Pick[]> {
  const games = await getAllGamesForSeason(seasonId);
  return getAllPicksForGames(games.map((g) => g.id));
}
