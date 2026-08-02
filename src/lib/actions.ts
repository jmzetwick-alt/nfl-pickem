"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PickSide } from "@/lib/types";

export async function submitPick(gameId: string, pickedSide: PickSide) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("picks")
    .select("id")
    .eq("user_id", user.id)
    .eq("game_id", gameId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("picks")
      .update({ picked_side: pickedSide } as never)
      .eq("id", (existing as { id: string }).id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("picks").insert({
      user_id: user.id,
      game_id: gameId,
      picked_side: pickedSide,
    } as never);
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/week/[weekNumber]", "page");
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  inviteCode: string
) {
  if (inviteCode !== process.env.INVITE_CODE) {
    return { error: "Invalid invite code" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { success: true };
}

export async function upsertGame(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Unauthorized" };

  const id = formData.get("id") as string | null;
  const weekId = formData.get("week_id") as string;
  const awayTeam = formData.get("away_team") as string;
  const homeTeam = formData.get("home_team") as string;
  const spread = parseFloat(formData.get("spread") as string);
  const kickoff = formData.get("kickoff") as string;
  const lockTime = (formData.get("lock_time") as string) || kickoff;
  const awayScoreRaw = formData.get("away_score") as string;
  const homeScoreRaw = formData.get("home_score") as string;
  const isFinal = formData.get("is_final") === "on";

  const payload = {
    week_id: weekId,
    away_team: awayTeam.trim(),
    home_team: homeTeam.trim(),
    spread,
    kickoff: new Date(kickoff).toISOString(),
    lock_time: new Date(lockTime).toISOString(),
    away_score: awayScoreRaw ? parseInt(awayScoreRaw, 10) : null,
    home_score: homeScoreRaw ? parseInt(homeScoreRaw, 10) : null,
    is_final: isFinal,
  };

  if (id) {
    const { error } = await supabase.from("games").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("games").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function deleteGame(gameId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Unauthorized" };

  const { error } = await supabase.from("games").delete().eq("id", gameId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function upsertWeek(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Unauthorized" };

  const seasonId = formData.get("season_id") as string;
  const weekNumber = parseInt(formData.get("week_number") as string, 10);
  const label = formData.get("label") as string;

  const { error } = await supabase.from("weeks").upsert(
    { season_id: seasonId, week_number: weekNumber, label },
    { onConflict: "season_id,week_number" }
  );

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function createSeason(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Unauthorized" };

  const year = parseInt(formData.get("year") as string, 10);
  const name = formData.get("name") as string;
  const setActive = formData.get("set_active") === "on";

  if (setActive) {
    await supabase.from("seasons").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");
  }

  const { error } = await supabase.from("seasons").insert({
    year,
    name,
    is_active: setActive,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}
