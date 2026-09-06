import { createClient } from "@/lib/supabase/client";
import { MatchRecord } from "@/types/game";

const LOCAL_STORAGE_KEY = "scoremaster_local_matches";

export async function saveMatchToSupabase(
  match: Omit<MatchRecord, "id">,
  userId: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createClient();

  try {
    // 1. Insert Match
    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .insert({
        user_id: userId,
        title: match.title,
        target_score: match.targetScore,
        status: match.status,
        winner_name: match.winnerName,
        total_rounds: match.totalRounds,
        created_at: match.createdAt,
        ended_at: match.endedAt || new Date().toISOString(),
      })
      .select("id")
      .single();

    if (matchError || !matchData) {
      throw new Error(matchError?.message || "Không thể tạo trận đấu");
    }

    const matchId = matchData.id;

    // 2. Insert Match Players
    const playersToInsert = match.players.map((p) => ({
      match_id: matchId,
      player_name: p.name,
      current_score: p.score,
      player_order: p.order,
    }));

    const { error: playersError } = await supabase
      .from("match_players")
      .insert(playersToInsert);

    if (playersError) {
      console.error("Lỗi khi lưu người chơi:", playersError);
    }

    // 3. Insert Match Rounds
    if (match.rounds.length > 0) {
      const roundsToInsert = match.rounds.map((r) => ({
        match_id: matchId,
        round_number: r.roundNumber,
        winner_player_name: r.winnerPlayerName,
        created_at: r.createdAt,
      }));

      const { error: roundsError } = await supabase
        .from("match_rounds")
        .insert(roundsToInsert);

      if (roundsError) {
        console.error("Lỗi khi lưu lịch sử hiệp đấu:", roundsError);
      }
    }

    return { success: true, id: matchId };
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("Save match error:", e);
    return { success: false, error: e.message || "Lỗi lưu trận đấu lên Supabase" };
  }
}

export function saveMatchToLocal(match: MatchRecord) {
  try {
    const existing = getLocalMatches();
    const updated = [match, ...existing.filter((m) => m.id !== match.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
  } catch (err) {
    console.error("Local storage error:", err);
  }
}

export function getLocalMatches(): MatchRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function fetchUserMatches(userId: string): Promise<MatchRecord[]> {
  const supabase = createClient();

  try {
    const { data: matches, error } = await supabase
      .from("matches")
      .select(`
        id,
        title,
        target_score,
        status,
        winner_name,
        total_rounds,
        created_at,
        ended_at,
        match_players (
          player_name,
          current_score,
          player_order
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !matches) {
      console.error("Fetch matches error:", error);
      return [];
    }

    interface MatchPlayerRow {
      player_name: string;
      current_score: number;
      player_order: number;
    }

    interface MatchRoundRow {
      round_number: number;
      winner_player_name: string;
      created_at: string;
    }

    interface MatchRow {
      id: string;
      title: string;
      target_score: number;
      status: "in_progress" | "completed" | "cancelled";
      winner_name: string | null;
      total_rounds: number;
      created_at: string;
      ended_at: string | null;
      match_players?: MatchPlayerRow[];
      match_rounds?: MatchRoundRow[];
    }

    return (matches as unknown as MatchRow[]).map((m) => ({
      id: m.id,
      title: m.title,
      targetScore: m.target_score,
      status: m.status,
      winnerName: m.winner_name,
      totalRounds: m.total_rounds,
      createdAt: m.created_at,
      endedAt: m.ended_at || undefined,
      players: (m.match_players || []).map((p) => ({
        name: p.player_name,
        score: p.current_score,
        order: p.player_order,
      })),
      rounds: [],
    }));
  } catch (err) {
    console.error("fetchUserMatches error:", err);
    return [];
  }
}

export async function fetchMatchDetails(matchId: string): Promise<MatchRecord | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        id,
        title,
        target_score,
        status,
        winner_name,
        total_rounds,
        created_at,
        ended_at,
        match_players (
          player_name,
          current_score,
          player_order
        ),
        match_rounds (
          round_number,
          winner_player_name,
          created_at
        )
      `)
      .eq("id", matchId)
      .single();

    if (error || !data) return null;

    interface MatchPlayerRow {
      player_name: string;
      current_score: number;
      player_order: number;
    }

    interface MatchRoundRow {
      round_number: number;
      winner_player_name: string;
      created_at: string;
    }

    interface SingleMatchRow {
      id: string;
      title: string;
      target_score: number;
      status: "in_progress" | "completed" | "cancelled";
      winner_name: string | null;
      total_rounds: number;
      created_at: string;
      ended_at: string | null;
      match_players?: MatchPlayerRow[];
      match_rounds?: MatchRoundRow[];
    }

    const m = data as unknown as SingleMatchRow;

    return {
      id: m.id,
      title: m.title,
      targetScore: m.target_score,
      status: m.status,
      winnerName: m.winner_name,
      totalRounds: m.total_rounds,
      createdAt: m.created_at,
      endedAt: m.ended_at || undefined,
      players: (m.match_players || []).map((p) => ({
        name: p.player_name,
        score: p.current_score,
        order: p.player_order,
      })),
      rounds: (m.match_rounds || []).map((r) => ({
        roundNumber: r.round_number,
        winnerPlayerName: r.winner_player_name,
        createdAt: r.created_at,
      })),
    };
  } catch (err) {
    console.error("fetchMatchDetails error:", err);
    return null;
  }
}
