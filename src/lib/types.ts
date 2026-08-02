export type Profile = {
  id: string;
  display_name: string;
  is_admin: boolean;
  created_at: string;
};

export type Season = {
  id: string;
  year: number;
  name: string;
  is_active: boolean;
  created_at: string;
};

export type Week = {
  id: string;
  season_id: string;
  week_number: number;
  label: string;
  created_at: string;
};

export type Game = {
  id: string;
  week_id: string;
  away_team: string;
  home_team: string;
  spread: number;
  kickoff: string;
  lock_time: string;
  away_score: number | null;
  home_score: number | null;
  is_final: boolean;
  created_at: string;
  updated_at: string;
};

export type Pick = {
  id: string;
  user_id: string;
  game_id: string;
  picked_side: "home" | "away";
  created_at: string;
  updated_at: string;
};

export type PickSide = Pick["picked_side"];

export type GameWithPick = Game & {
  pick: Pick | null;
};

export type PickResult = "win" | "loss" | "push" | "pending" | "locked_no_pick";

export type UserStanding = {
  user_id: string;
  display_name: string;
  wins: number;
  losses: number;
  pushes: number;
  pending: number;
  win_pct: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Omit<Profile, "id">>;
        Relationships: [];
      };
      seasons: {
        Row: Season;
        Insert: Omit<Season, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Season, "id">>;
        Relationships: [];
      };
      weeks: {
        Row: Week;
        Insert: Omit<Week, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Week, "id">>;
        Relationships: [];
      };
      games: {
        Row: Game;
        Insert: Omit<Game, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Game, "id">>;
        Relationships: [];
      };
      picks: {
        Row: Pick;
        Insert: Omit<Pick, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Pick, "id">>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
