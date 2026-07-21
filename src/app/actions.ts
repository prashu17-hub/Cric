"use server";

import { neon } from "@neondatabase/serverless";

// --- Response type for all actions ---
interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- Get a SQL client (throws if DATABASE_URL is not set) ---
function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return neon(url);
}

// =============================================================================
// 1. DATABASE INITIALIZATION
// =============================================================================

export async function initDatabase(): Promise<ActionResponse> {
  try {
    const sql = getSQL();

    await sql`
      CREATE TABLE IF NOT EXISTS teams (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        abbv VARCHAR(10) UNIQUE NOT NULL,
        color VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS players (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        team_id VARCHAR(50) REFERENCES teams(id) ON DELETE SET NULL,
        role VARCHAR(100) NOT NULL,
        jersey_num INT NOT NULL,
        batting_style VARCHAR(100) NOT NULL,
        bowling_style VARCHAR(100) NOT NULL,
        matches INT DEFAULT 0,
        runs INT DEFAULT 0,
        high_score INT DEFAULT 0,
        wickets INT DEFAULT 0,
        best_bowling_runs INT DEFAULT 0,
        best_bowling_wkts INT DEFAULT 0,
        jersey_color VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS matches (
        id VARCHAR(50) PRIMARY KEY,
        team1_id VARCHAR(50) REFERENCES teams(id) ON DELETE CASCADE,
        team2_id VARCHAR(50) REFERENCES teams(id) ON DELETE CASCADE,
        runs1 INT NOT NULL,
        wickets1 INT NOT NULL,
        overs1 DECIMAL(4,1) NOT NULL,
        runs2 INT NOT NULL,
        wickets2 INT NOT NULL,
        overs2 DECIMAL(4,1) NOT NULL,
        notes TEXT,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return { success: true };
  } catch (error) {
    console.error("initDatabase error:", error);
    return { success: false, error: String(error) };
  }
}

// =============================================================================
// 2. DATA RETRIEVAL
// =============================================================================

interface LeagueData {
  teams: {
    id: string;
    name: string;
    abbv: string;
    color: string;
  }[];
  players: {
    id: string;
    name: string;
    age: number;
    teamId: string;
    role: "Batsman" | "Bowler" | "All-Rounder" | "Wicketkeeper";
    jerseyNum: number;
    battingStyle: string;
    bowlingStyle: string;
    matches: number;
    runs: number;
    highScore: number;
    wickets: number;
    bestBowlingRuns: number;
    bestBowlingWkts: number;
    jerseyColor: string;
  }[];
  matches: {
    id: string;
    team1Id: string;
    team2Id: string;
    runs1: number;
    wickets1: number;
    overs1: number;
    runs2: number;
    wickets2: number;
    overs2: number;
    notes?: string;
  }[];
}

export async function getLeagueData(): Promise<ActionResponse<LeagueData>> {
  try {
    const sql = getSQL();

    const teamsRows = await sql`SELECT id, name, abbv, color FROM teams ORDER BY created_at`;
    const playersRows = await sql`
      SELECT id, name, age, team_id, role, jersey_num, batting_style, bowling_style,
             matches, runs, high_score, wickets, best_bowling_runs, best_bowling_wkts, jersey_color
      FROM players ORDER BY created_at
    `;
    const matchesRows = await sql`
      SELECT id, team1_id, team2_id, runs1, wickets1, overs1, runs2, wickets2, overs2, notes
      FROM matches ORDER BY played_at
    `;

    // Map DB snake_case to frontend camelCase
    const teams = teamsRows.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      abbv: r.abbv as string,
      color: r.color as string,
    }));

    const players = playersRows.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      age: Number(r.age),
      teamId: r.team_id as string,
      role: r.role as "Batsman" | "Bowler" | "All-Rounder" | "Wicketkeeper",
      jerseyNum: Number(r.jersey_num),
      battingStyle: r.batting_style as string,
      bowlingStyle: r.bowling_style as string,
      matches: Number(r.matches),
      runs: Number(r.runs),
      highScore: Number(r.high_score),
      wickets: Number(r.wickets),
      bestBowlingRuns: Number(r.best_bowling_runs),
      bestBowlingWkts: Number(r.best_bowling_wkts),
      jerseyColor: (r.jersey_color as string) || "#3b82f6",
    }));

    const matchesMapped = matchesRows.map((r) => ({
      id: r.id as string,
      team1Id: r.team1_id as string,
      team2Id: r.team2_id as string,
      runs1: Number(r.runs1),
      wickets1: Number(r.wickets1),
      overs1: Number(r.overs1),
      runs2: Number(r.runs2),
      wickets2: Number(r.wickets2),
      overs2: Number(r.overs2),
      notes: (r.notes as string) || undefined,
    }));

    return {
      success: true,
      data: { teams, players, matches: matchesMapped },
    };
  } catch (error) {
    console.error("getLeagueData error:", error);
    return { success: false, error: String(error) };
  }
}

// =============================================================================
// 3. TEAM ACTIONS
// =============================================================================

interface CreateTeamInput {
  name: string;
  abbv: string;
  color: string;
}

export async function createTeamAction(
  input: CreateTeamInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    // Validate
    if (!input.name || input.name.trim().length === 0) {
      return { success: false, error: "Team name is required" };
    }
    if (!input.abbv || input.abbv.trim().length === 0) {
      return { success: false, error: "Abbreviation is required" };
    }

    const sql = getSQL();
    const id = "team-" + Date.now();
    const name = input.name.trim();
    const abbv = input.abbv.trim().toUpperCase();
    const color = input.color || "#06b6d4";

    // Check for duplicates
    const existingName = await sql`SELECT id FROM teams WHERE LOWER(name) = LOWER(${name})`;
    if (existingName.length > 0) {
      return { success: false, error: "A team with this name already exists" };
    }
    const existingAbbv = await sql`SELECT id FROM teams WHERE abbv = ${abbv}`;
    if (existingAbbv.length > 0) {
      return { success: false, error: "This abbreviation is already taken" };
    }

    await sql`
      INSERT INTO teams (id, name, abbv, color)
      VALUES (${id}, ${name}, ${abbv}, ${color})
    `;

    return { success: true, data: { id } };
  } catch (error) {
    console.error("createTeamAction error:", error);
    return { success: false, error: String(error) };
  }
}

// =============================================================================
// 4. PLAYER ACTIONS
// =============================================================================

interface SavePlayerInput {
  name: string;
  age: number;
  teamId: string;
  role: string;
  jerseyNum: number;
  battingStyle: string;
  bowlingStyle: string;
  matches: number;
  runs: number;
  highScore: number;
  wickets: number;
  bestBowlingRuns: number;
  bestBowlingWkts: number;
  jerseyColor: string;
}

export async function savePlayerAction(
  input: SavePlayerInput,
  editingId: string | null
): Promise<ActionResponse<{ id: string }>> {
  try {
    // Validate
    if (!input.name || input.name.trim().length === 0) {
      return { success: false, error: "Player name is required" };
    }
    if (!input.teamId) {
      return { success: false, error: "Team assignment is required" };
    }
    if (!input.role) {
      return { success: false, error: "Specialist role is required" };
    }

    const sql = getSQL();

    const name = input.name.trim();
    const age = Number(input.age) || 0;
    const teamId = input.teamId;
    const role = input.role;
    const jerseyNum = Number(input.jerseyNum) || 0;
    const battingStyle = input.battingStyle || "Right-Handed";
    const bowlingStyle = input.bowlingStyle || "None";
    const matchesPlayed = Number(input.matches) || 0;
    const runs = Number(input.runs) || 0;
    const highScore = Number(input.highScore) || 0;
    const wickets = Number(input.wickets) || 0;
    const bestBowlingRuns = Number(input.bestBowlingRuns) || 0;
    const bestBowlingWkts = Number(input.bestBowlingWkts) || 0;
    const jerseyColor = input.jerseyColor || "#3b82f6";

    if (editingId) {
      // UPDATE existing player
      await sql`
        UPDATE players SET
          name = ${name},
          age = ${age},
          team_id = ${teamId},
          role = ${role},
          jersey_num = ${jerseyNum},
          batting_style = ${battingStyle},
          bowling_style = ${bowlingStyle},
          matches = ${matchesPlayed},
          runs = ${runs},
          high_score = ${highScore},
          wickets = ${wickets},
          best_bowling_runs = ${bestBowlingRuns},
          best_bowling_wkts = ${bestBowlingWkts},
          jersey_color = ${jerseyColor}
        WHERE id = ${editingId}
      `;
      return { success: true, data: { id: editingId } };
    } else {
      // INSERT new player
      const id = "player-" + Date.now();
      await sql`
        INSERT INTO players (id, name, age, team_id, role, jersey_num, batting_style, bowling_style, matches, runs, high_score, wickets, best_bowling_runs, best_bowling_wkts, jersey_color)
        VALUES (${id}, ${name}, ${age}, ${teamId}, ${role}, ${jerseyNum}, ${battingStyle}, ${bowlingStyle}, ${matchesPlayed}, ${runs}, ${highScore}, ${wickets}, ${bestBowlingRuns}, ${bestBowlingWkts}, ${jerseyColor})
      `;
      return { success: true, data: { id } };
    }
  } catch (error) {
    console.error("savePlayerAction error:", error);
    return { success: false, error: String(error) };
  }
}

export async function deletePlayerAction(
  id: string
): Promise<ActionResponse> {
  try {
    if (!id) {
      return { success: false, error: "Player ID is required" };
    }
    const sql = getSQL();
    await sql`DELETE FROM players WHERE id = ${id}`;
    return { success: true };
  } catch (error) {
    console.error("deletePlayerAction error:", error);
    return { success: false, error: String(error) };
  }
}

// =============================================================================
// 5. MATCH ACTIONS
// =============================================================================

interface RecordMatchInput {
  team1Id: string;
  team2Id: string;
  runs1: number;
  wickets1: number;
  overs1: number;
  runs2: number;
  wickets2: number;
  overs2: number;
  notes?: string;
}

export async function recordMatchAction(
  input: RecordMatchInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    // Validate
    if (!input.team1Id || !input.team2Id) {
      return { success: false, error: "Both teams must be selected" };
    }
    if (input.team1Id === input.team2Id) {
      return { success: false, error: "A team cannot play against itself" };
    }

    const sql = getSQL();
    const id = "match-" + Date.now();

    await sql`
      INSERT INTO matches (id, team1_id, team2_id, runs1, wickets1, overs1, runs2, wickets2, overs2, notes)
      VALUES (
        ${id},
        ${input.team1Id},
        ${input.team2Id},
        ${Number(input.runs1)},
        ${Number(input.wickets1)},
        ${Number(input.overs1)},
        ${Number(input.runs2)},
        ${Number(input.wickets2)},
        ${Number(input.overs2)},
        ${input.notes || null}
      )
    `;

    return { success: true, data: { id } };
  } catch (error) {
    console.error("recordMatchAction error:", error);
    return { success: false, error: String(error) };
  }
}

export async function clearMatchesAction(): Promise<ActionResponse> {
  try {
    const sql = getSQL();
    await sql`DELETE FROM matches`;
    return { success: true };
  } catch (error) {
    console.error("clearMatchesAction error:", error);
    return { success: false, error: String(error) };
  }
}
