"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  initDatabase,
  getLeagueData,
  savePlayerAction,
  deletePlayerAction,
  createTeamAction,
  recordMatchAction,
  clearMatchesAction
} from "./actions";
import { 
  Trophy, 
  LayoutDashboard, 
  Users, 
  Shield, 
  Calendar, 
  RefreshCw, 
  PlusCircle, 
  UserPlus, 
  Swords, 
  Award, 
  History, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  Copy,
  Database,
  Wifi,
  WifiOff, 

  CheckCircle2, 
  X,
  Plus,
  Edit,
  Hand,
  Target,
  Sword,
  User,
  Info,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// --- TypeScript Interfaces ---
interface Player {
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
  jerseyColor?: string;
}

interface Team {
  id: string;
  name: string;
  abbv: string;
  color: string;
}

interface Match {
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
}

interface TeamStats {
  id: string;
  name: string;
  abbv: string;
  color: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  runsScored: number;
  oversFaced: number;
  runsConceded: number;
  oversBowled: number;
  nrr: string;
}

// --- Default/Mock Data ---
const defaultTeams: Team[] = [
  { id: "team-1", name: "Palamaner", abbv: "PAL", color: "#3b82f6" },
  { id: "team-2", name: "Chittoor", abbv: "CHI", color: "#ef4444" },
  { id: "team-3", name: "Tirupati", abbv: "TIR", color: "#f59e0b" },
  { id: "team-4", name: "Ponganur", abbv: "PUN", color: "#10b981" }
];

const defaultPlayers: Player[] = [
  {
    id: "player-1",
    name: "Virat Kohli",
    age: 37,
    teamId: "team-1",
    role: "Batsman",
    jerseyNum: 18,
    battingStyle: "Right-Handed",
    bowlingStyle: "None",
    matches: 220,
    runs: 8200,
    highScore: 113,
    wickets: 4,
    bestBowlingRuns: 15,
    bestBowlingWkts: 1,
    jerseyColor: "#3b82f6"
  },
  {
    id: "player-2",
    name: "Jasprit Bumrah",
    age: 28,
    teamId: "team-2",
    role: "Bowler",
    jerseyNum: 93,
    battingStyle: "Right-Handed",
    bowlingStyle: "Right-Arm Fast",
    matches: 120,
    runs: 250,
    highScore: 34,
    wickets: 130,
    bestBowlingRuns: 10,
    bestBowlingWkts: 5,
    jerseyColor: "#ef4444"
  },
  {
    id: "player-3",
    name: "Ravindra Jadeja",
    age: 33,
    teamId: "team-3",
    role: "All-Rounder",
    jerseyNum: 8,
    battingStyle: "Left-Handed",
    bowlingStyle: "Left-Arm Spin",
    matches: 200,
    runs: 3100,
    highScore: 62,
    wickets: 120,
    bestBowlingRuns: 16,
    bestBowlingWkts: 5,
    jerseyColor: "#f59e0b"
  },
  {
    id: "player-4",
    name: "Rishabh Pant",
    age: 24,
    teamId: "team-4",
    role: "Wicketkeeper",
    jerseyNum: 17,
    battingStyle: "Left-Handed",
    bowlingStyle: "None",
    matches: 98,
    runs: 2800,
    highScore: 128,
    wickets: 0,
    bestBowlingRuns: 0,
    bestBowlingWkts: 0,
    jerseyColor: "#10b981"
  }
];

const defaultMatches: Match[] = [
  {
    id: "match-1",
    team1Id: "team-1",
    team2Id: "team-2",
    runs1: 180,
    wickets1: 4,
    overs1: 20.0,
    runs2: 181,
    wickets2: 2,
    overs2: 19.2,
    notes: "Chittoor won in a high scoring chase."
  },
  {
    id: "match-2",
    team1Id: "team-3",
    team2Id: "team-2",
    runs1: 155,
    wickets1: 8,
    overs1: 20.0,
    runs2: 140,
    wickets2: 10,
    overs2: 18.4,
    notes: "Tirupati defend 155 with excellent bowling display."
  }
];

// --- Jersey Sub-component ---
interface JerseyProps {
  color: string;
  number?: string | number;
}

const Jersey: React.FC<JerseyProps> = ({ color, number = "00" }) => {
  return (
    <svg viewBox="0 0 100 100" className="player-jersey-svg">
      {/* Sleeve Right */}
      <path d="M68 22 L88 36 L78 48 L68 38 Z" fill={color} opacity="0.9" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      {/* Sleeve Left */}
      <path d="M32 22 L12 36 L22 48 L32 38 Z" fill={color} opacity="0.9" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      {/* Jersey Body */}
      <path d="M32 22 L68 22 L68 84 L32 84 Z" fill={color} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      {/* Jersey Trim/Details */}
      <path d="M42 22 L50 32 L58 22" fill="none" stroke="#ffffff" strokeWidth="2.5"/>
      <path d="M32 84 L68 84" stroke="rgba(0,0,0,0.3)" strokeWidth="4"/>
      {/* Number */}
      <text x="50" y="58" fontFamily="'Outfit', sans-serif" fontSize="22" fontWeight="800" fill="#ffffff" textAnchor="middle" letterSpacing="-1">{number}</text>
    </svg>
  );
};

// --- Show Toast Helper ---
function showToast(message: string, type: "success" | "error" | "info" = "success") {
  if (typeof document === "undefined") return;
  const container = document.getElementById("toast-container");
  if (!container) return;
  
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  // Custom inline SVG icons matching Lucide styling
  let iconSvg = "";
  if (type === "success") {
    iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  } else if (type === "error") {
    iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else {
    iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${iconSvg} <span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --- Main Page Component ---
export default function Home() {
  const [mounted, setMounted] = useState(false);

  // --- Core States ---
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  
  const [activeView, setActiveView] = useState<"dashboard" | "players" | "teams" | "fixtures" | "database">("dashboard");
  
  const [dbStatus, setDbStatus] = useState<"connecting" | "connected" | "error" | "no-config">("connecting");
  const [dbError, setDbError] = useState<string | null>(null);

  // --- Filtering & Search ---
  const [playerSearch, setPlayerSearch] = useState("");
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  // --- Modal Open/Close Controls ---
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [playerDetailModalOpen, setPlayerDetailModalOpen] = useState(false);

  // --- Selected/Editing Records ---
  const [detailPlayerId, setDetailPlayerId] = useState<string | null>(null);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  // --- Form States ---
  // Player Form
  const [playerForm, setPlayerForm] = useState({
    name: "",
    age: "" as any,
    teamId: "",
    role: "" as any,
    jerseyNum: "" as any,
    battingStyle: "",
    bowlingStyle: "",
    matches: "" as any,
    runs: "" as any,
    highScore: "" as any,
    wickets: "" as any,
    bestBowlingRuns: "" as any,
    bestBowlingWkts: "" as any,
    jerseyColor: "#3b82f6"
  });

  // Team Form
  const [teamForm, setTeamForm] = useState({
    name: "",
    abbv: "",
    color: "#06b6d4"
  });

  // Match Form
  const [matchForm, setMatchForm] = useState({
    team1Id: "",
    team2Id: "",
    runs1: "",
    wickets1: "",
    overs1: "",
    runs2: "",
    wickets2: "",
    overs2: "",
    notes: ""
  });

  // --- 1. Mount Effect: Initialize Database & Load Data ---
  const refreshData = useCallback(async () => {
    try {
      const result = await getLeagueData();
      if (result.success && result.data) {
        setTeams(result.data.teams);
        setPlayers(result.data.players);
        setMatches(result.data.matches);
        setDbStatus("connected");
        setDbError(null);
      } else {
        // If DB returns no data but no error, use defaults for first launch
        if (result.error?.includes("DATABASE_URL")) {
          setDbStatus("no-config");
          setDbError("DATABASE_URL is not configured");
          // Fall back to default demo data
          setTeams(defaultTeams);
          setPlayers(defaultPlayers);
          setMatches(defaultMatches);
        } else {
          setDbStatus("error");
          setDbError(result.error || "Unknown error");
        }
      }
    } catch (err) {
      setDbStatus("error");
      setDbError(String(err));
      // Fall back to default demo data on error
      setTeams(defaultTeams);
      setPlayers(defaultPlayers);
      setMatches(defaultMatches);
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      setMounted(true);
      setDbStatus("connecting");
      try {
        const initResult = await initDatabase();
        if (!initResult.success) {
          if (initResult.error?.includes("DATABASE_URL")) {
            setDbStatus("no-config");
            setDbError("DATABASE_URL environment variable is not set. Using demo data.");
            setTeams(defaultTeams);
            setPlayers(defaultPlayers);
            setMatches(defaultMatches);
            return;
          }
          setDbStatus("error");
          setDbError(initResult.error || "Failed to initialize database");
          setTeams(defaultTeams);
          setPlayers(defaultPlayers);
          setMatches(defaultMatches);
          return;
        }
        await refreshData();
      } catch (err) {
        setDbStatus("error");
        setDbError(String(err));
        setTeams(defaultTeams);
        setPlayers(defaultPlayers);
        setMatches(defaultMatches);
      }
    };
    bootstrap();
  }, [refreshData]);

  // --- 4. Standings & Calculations ---
  // Helper to convert Overs Decimal to fractional overs (e.g. 19.2 -> 19 + 2/6 = 19.33)
  const toFractionalOvers = (oversDecimal: number, wickets: number) => {
    if (wickets === 10) return 20.0;
    const whole = Math.floor(oversDecimal);
    const balls = Math.round((oversDecimal - whole) * 10);
    return whole + (balls / 6);
  };

  const standings = useMemo((): TeamStats[] => {
    const stats: Record<string, Omit<TeamStats, "nrr">> = {};
    
    // Initialize Stats for all teams
    teams.forEach(t => {
      stats[t.id] = {
        id: t.id,
        name: t.name,
        abbv: t.abbv,
        color: t.color,
        played: 0,
        won: 0,
        lost: 0,
        points: 0,
        runsScored: 0,
        oversFaced: 0,
        runsConceded: 0,
        oversBowled: 0
      };
    });

    // Iterate over matches to compute stats
    matches.forEach(m => {
      // Handles alternative structure keys just in case
      const team2Id = m.team2Id;
      const t1 = stats[m.team1Id];
      const t2 = stats[team2Id];
      
      if (!t1 || !t2) return;

      t1.played++;
      t2.played++;

      t1.runsScored += m.runs1;
      t1.runsConceded += m.runs2;
      t2.runsScored += m.runs2;
      t2.runsConceded += m.runs1;

      const fOvers1 = toFractionalOvers(m.overs1, m.wickets1);
      const fOvers2 = toFractionalOvers(m.overs2, m.wickets2);

      t1.oversFaced += fOvers1;
      t1.oversBowled += fOvers2;
      t2.oversFaced += fOvers2;
      t2.oversBowled += fOvers1;

      if (m.runs1 > m.runs2) {
        t1.won++;
        t2.lost++;
        t1.points += 2;
      } else if (m.runs2 > m.runs1) {
        t2.won++;
        t1.lost++;
        t2.points += 2;
      } else {
        t1.points += 1;
        t2.points += 1;
      }
    });

    // Calculate NRR and compile standings
    const standingsList = Object.values(stats).map(t => {
      let nrr = 0.000;
      if (t.played > 0) {
        const scoringRate = t.oversFaced > 0 ? (t.runsScored / t.oversFaced) : 0;
        const concedingRate = t.oversBowled > 0 ? (t.runsConceded / t.oversBowled) : 0;
        nrr = scoringRate - concedingRate;
      }
      return {
        ...t,
        nrr: nrr.toFixed(3)
      };
    });

    // Sort standings: Points desc, Wins desc, NRR desc, Name asc
    return standingsList.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.won !== a.won) return b.won - a.won;
      if (parseFloat(b.nrr) !== parseFloat(a.nrr)) return parseFloat(b.nrr) - parseFloat(a.nrr);
      return a.name.localeCompare(b.name);
    });
  }, [teams, matches]);

  const topScorer = useMemo(() => {
    if (players.length === 0) return { name: "None", runs: 0 };
    return players.reduce((top, p) => p.runs > top.runs ? p : top, { name: "None", runs: -1 });
  }, [players]);

  const filteredPlayersList = useMemo(() => {
    return players.filter(p => {
      const matchQuery = p.name.toLowerCase().includes(playerSearch.toLowerCase());
      const matchTeamFilter = filterTeam === "all" || p.teamId === filterTeam;
      const matchRoleFilter = filterRole === "all" || p.role === filterRole;
      return matchQuery && matchTeamFilter && matchRoleFilter;
    });
  }, [players, playerSearch, filterTeam, filterRole]);

  // --- 5. Form Actions (using Server Actions) ---
  const handlePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = editingPlayerId !== null;

    const payload = {
      name: playerForm.name,
      age: Number(playerForm.age) || 0,
      teamId: playerForm.teamId,
      role: playerForm.role,
      jerseyNum: Number(playerForm.jerseyNum) || 0,
      battingStyle: playerForm.battingStyle,
      bowlingStyle: playerForm.bowlingStyle,
      matches: Number(playerForm.matches) || 0,
      runs: Number(playerForm.runs) || 0,
      highScore: Number(playerForm.highScore) || 0,
      wickets: Number(playerForm.wickets) || 0,
      bestBowlingRuns: Number(playerForm.bestBowlingRuns) || 0,
      bestBowlingWkts: Number(playerForm.bestBowlingWkts) || 0,
      jerseyColor: playerForm.jerseyColor || "#3b82f6",
    };

    const result = await savePlayerAction(payload, isEdit ? editingPlayerId : null);
    if (result.success) {
      showToast(isEdit ? `Updated player profile for ${playerForm.name}` : `Registered player ${playerForm.name} successfully!`);
      await refreshData();
    } else {
      showToast(result.error || "Failed to save player", "error");
    }

    setPlayerModalOpen(false);
    setEditingPlayerId(null);
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createTeamAction({
      name: teamForm.name,
      abbv: teamForm.abbv,
      color: teamForm.color,
    });

    if (result.success) {
      showToast(`Created team ${teamForm.name.trim()} successfully!`);
      await refreshData();
      setTeamModalOpen(false);
      setTeamForm({ name: "", abbv: "", color: "#06b6d4" });
    } else {
      showToast(result.error || "Failed to create team", "error");
    }
  };

  const handleMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t1 = matchForm.team1Id;
    const t2 = matchForm.team2Id;

    if (t1 === t2) {
      showToast("A team cannot play against itself!", "error");
      return;
    }

    const validateOvers = (ov: number) => {
      const dec = ov - Math.floor(ov);
      return Math.round(dec * 10) <= 5;
    };

    const ov1 = parseFloat(matchForm.overs1);
    const ov2 = parseFloat(matchForm.overs2);

    if (!validateOvers(ov1) || !validateOvers(ov2)) {
      showToast("Overs must be valid cricket format (e.g. 19.5 overs, maximum .5 balls)", "error");
      return;
    }

    const result = await recordMatchAction({
      team1Id: t1,
      team2Id: t2,
      runs1: parseInt(matchForm.runs1),
      wickets1: parseInt(matchForm.wickets1),
      overs1: ov1,
      runs2: parseInt(matchForm.runs2),
      wickets2: parseInt(matchForm.wickets2),
      overs2: ov2,
      notes: matchForm.notes || undefined,
    });

    if (result.success) {
      showToast("Match recorded successfully!");
      await refreshData();
      setMatchForm({
        team1Id: "",
        team2Id: "",
        runs1: "",
        wickets1: "",
        overs1: "",
        runs2: "",
        wickets2: "",
        overs2: "",
        notes: ""
      });
    } else {
      showToast(result.error || "Failed to record match", "error");
    }
  };

  const handleResetMatches = async () => {
    if (window.confirm("Are you sure you want to clear all match history? Points table will reset.")) {
      const result = await clearMatchesAction();
      if (result.success) {
        showToast("Match history cleared.", "info");
        await refreshData();
      } else {
        showToast(result.error || "Failed to clear matches", "error");
      }
    }
  };

  const handleDeletePlayer = async (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    if (window.confirm(`Are you sure you want to remove ${player.name} from the league database?`)) {
      const result = await deletePlayerAction(id);
      if (result.success) {
        showToast(`Removed player ${player.name} from directory.`, "info");
        setPlayerDetailModalOpen(false);
        await refreshData();
      } else {
        showToast(result.error || "Failed to delete player", "error");
      }
    }
  };

  // --- 6. Modal triggers ---
  const openRegisterPlayerModal = () => {
    setEditingPlayerId(null);
    setPlayerForm({
      name: "",
      age: "" as any,
      teamId: "",
      role: "" as any,
      jerseyNum: "" as any,
      battingStyle: "",
      bowlingStyle: "",
      matches: "" as any,
      runs: "" as any,
      highScore: "" as any,
      wickets: "" as any,
      bestBowlingRuns: "" as any,
      bestBowlingWkts: "" as any,
      jerseyColor: "#3b82f6"
    });
    setPlayerModalOpen(true);
  };

  const openEditPlayerModal = (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    setEditingPlayerId(id);
    setPlayerForm({
      name: player.name,
      age: player.age,
      teamId: player.teamId,
      role: player.role,
      jerseyNum: player.jerseyNum,
      battingStyle: player.battingStyle,
      bowlingStyle: player.bowlingStyle,
      matches: player.matches,
      runs: player.runs,
      highScore: player.highScore,
      wickets: player.wickets,
      bestBowlingRuns: player.bestBowlingRuns,
      bestBowlingWkts: player.bestBowlingWkts,
      jerseyColor: player.jerseyColor || "#3b82f6"
    });
    setPlayerDetailModalOpen(false);
    setPlayerModalOpen(true);
  };

  const openPlayerDetailModal = (id: string) => {
    setDetailPlayerId(id);
    setPlayerDetailModalOpen(true);
  };

  const handleViewTeamRoster = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    setFilterTeam(teamId);
    setFilterRole("all");
    setPlayerSearch("");
    setActiveView("players");
    showToast(`Showing roster for ${team.name}`, "info");
  };

  // Detailed Modal Ratings Calculations
  const detailPlayerData = useMemo(() => {
    if (!detailPlayerId) return null;
    const player = players.find(p => p.id === detailPlayerId);
    if (!player) return null;
    
    const team = teams.find(t => t.id === player.teamId);
    
    // Batting rating calculation: cap at 8000 runs, weighting avg high score
    const runScore = Math.min((player.runs / 8000) * 70, 70);
    const hsScore = Math.min((player.highScore / 150) * 30, 30);
    const battingRating = Math.round(runScore + hsScore);

    // Bowling rating calculation: cap at 150 wickets
    const wktsScore = Math.min((player.wickets / 150) * 75, 75);
    const hasBest = player.bestBowlingWkts > 0;
    const bestScore = hasBest ? Math.min((player.bestBowlingWkts / 5) * 25, 25) : 0;
    const bowlingRating = player.role === "Batsman" && player.wickets === 0 ? 0 : Math.round(wktsScore + bestScore);

    const battingAvg = player.matches > 0 ? (player.runs / player.matches).toFixed(2) : "0.00";

    return {
      player,
      team,
      battingRating,
      bowlingRating,
      battingAvg
    };
  }, [detailPlayerId, players, teams]);

  const viewTitles = {
    dashboard: { title: "Dashboard Overview", subtitle: "Real-time league standings, recent match results, and active teams." },
    players: { title: "Player Directory", subtitle: "Search, filter, and review player statistics and profiles." },
    teams: { title: "Team Rosters", subtitle: "Manage league franchises and evaluate team composition." },
    fixtures: { title: "Match Center", subtitle: "Record scores and review league match results." },
    database: { title: "Database Connection", subtitle: "View PostgreSQL database status, connection health, and data statistics." }
  };

  const getRoleIcon = (role: Player["role"]) => {
    switch (role) {
      case "Batsman": return <Sword style={{ width: 14, height: 14 }} />;
      case "Bowler": return <Target style={{ width: 14, height: 14 }} />;
      case "All-Rounder": return <Swords style={{ width: 14, height: 14 }} />;
      case "Wicketkeeper": return <Hand style={{ width: 14, height: 14 }} />;
      default: return <User style={{ width: 14, height: 14 }} />;
    }
  };

  if (!mounted) return null;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-icon">
            <Trophy />
          </div>
          <h1>LeagueManager</h1>
        </div>
        
        <nav className="nav-menu">
          <li className={`nav-item ${activeView === "dashboard" ? "active" : ""}`} onClick={() => setActiveView("dashboard")}>
            <a href="#">
              <LayoutDashboard />
              <span>Dashboard</span>
            </a>
          </li>
          <li className={`nav-item ${activeView === "players" ? "active" : ""}`} onClick={() => setActiveView("players")}>
            <a href="#">
              <Users />
              <span>Player Directory</span>
            </a>
          </li>
          <li className={`nav-item ${activeView === "teams" ? "active" : ""}`} onClick={() => setActiveView("teams")}>
            <a href="#">
              <Shield />
              <span>Team Rosters</span>
            </a>
          </li>
          <li className={`nav-item ${activeView === "fixtures" ? "active" : ""}`} onClick={() => setActiveView("fixtures")}>
            <a href="#">
              <Calendar />
              <span>Match Center</span>
            </a>
          </li>
          <li className={`nav-item ${activeView === "database" ? "active" : ""}`} onClick={() => setActiveView("database")}>
            <a href="#">
              <Database />
              <span>Database</span>
              <span className={`sync-dot status-${dbStatus === "connected" ? "synced" : dbStatus === "connecting" ? "syncing" : "error"}`} id="sidebar-db-dot"></span>
            </a>
          </li>
        </nav>
        
        <div className="sidebar-footer">
          <div className="league-badge">
            <span className="league-badge-img">🏏</span>
            <div className="league-badge-info">
              <h4>Pro Cricket League</h4>
              <p>Season 2026</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* Top Content Header */}
        <header className="content-header">
          <div className="header-title">
            <h2>{viewTitles[activeView].title}</h2>
            <p>{viewTitles[activeView].subtitle}</p>
          </div>
          <div className="quick-actions">
            <button className="btn btn-secondary" onClick={() => setTeamModalOpen(true)}>
              <PlusCircle />
              <span>New Team</span>
            </button>
            <button className="btn btn-primary" onClick={openRegisterPlayerModal}>
              <UserPlus />
              <span>Register Player</span>
            </button>
          </div>
        </header>

        {/* --- VIEW 1: DASHBOARD VIEW --- */}
        {activeView === "dashboard" && (
          <section className="view-pane active">
            
            {/* Stats Row */}
            <div className="stats-grid">
              <div className="stat-card cyan">
                <div className="stat-icon"><Shield /></div>
                <div className="stat-info">
                  <span className="stat-label">Total Teams</span>
                  <span className="stat-value">{teams.length}</span>
                </div>
              </div>
              <div className="stat-card emerald">
                <div className="stat-icon"><Users /></div>
                <div className="stat-info">
                  <span className="stat-label">Active Players</span>
                  <span className="stat-value">{players.length}</span>
                </div>
              </div>
              <div className="stat-card amber">
                <div className="stat-icon"><Swords /></div>
                <div className="stat-info">
                  <span className="stat-label">Matches Played</span>
                  <span className="stat-value">{matches.length}</span>
                </div>
              </div>
              <div className="stat-card violet">
                <div className="stat-icon"><Award /></div>
                <div className="stat-info">
                  <span className="stat-label">Top Scorer</span>
                  <span className="stat-value" style={{ fontSize: "1.1rem" }}>
                    {topScorer.name !== "None" ? `${topScorer.name} (${topScorer.runs} runs)` : "None"}
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard Layout Split */}
            <div className="dashboard-layout">
              {/* Standings Table Card */}
              <div className="glass-card">
                <div className="card-header">
                  <h3>
                    <Award style={{ color: "var(--accent-amber)" }} />
                    League Standings
                  </h3>
                  <span className="badge badge-amber">Updated Live</span>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Team</th>
                        <th style={{ textAlign: "center" }}>P</th>
                        <th style={{ textAlign: "center" }}>W</th>
                        <th style={{ textAlign: "center" }}>L</th>
                        <th style={{ textAlign: "center" }}>Pts</th>
                        <th style={{ textAlign: "right" }}>NRR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team, index) => {
                        const sign = parseFloat(team.nrr) >= 0 ? "+" : "";
                        return (
                          <tr key={team.id} className="standing-row">
                            <td>
                              <span className="rank-badge">{index + 1}</span>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span className="team-indicator-dot" style={{ backgroundColor: team.color }}></span>
                                <span style={{ fontWeight: 600 }}>{team.name}</span>
                                {team.abbv && <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>({team.abbv})</span>}
                              </div>
                            </td>
                            <td style={{ textAlign: "center", fontFamily: "var(--font-display)" }}>{team.played}</td>
                            <td style={{ textAlign: "center", color: "var(--accent-emerald)", fontWeight: 600 }}>{team.won}</td>
                            <td style={{ textAlign: "center", color: "var(--accent-rose)", fontWeight: 600 }}>{team.lost}</td>
                            <td style={{ textAlign: "center", fontWeight: 700, color: "var(--accent-cyan)", fontSize: "1rem" }}>{team.points}</td>
                            <td style={{ textAlign: "right", fontFamily: "var(--font-display)", fontWeight: 600 }}>{sign}{team.nrr}</td>
                          </tr>
                        );
                      })}
                      {standings.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                            No teams registered yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Matches Card */}
              <div className="glass-card">
                <div className="card-header">
                  <h3>
                    <History style={{ color: "var(--accent-cyan)" }} />
                    Recent Results
                  </h3>
                  <button className="btn btn-secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }} onClick={() => setActiveView("fixtures")}>
                    View All
                  </button>
                </div>
                <div className="activity-list">
                  {matches.slice().reverse().slice(0, 4).map(m => {
                    const t1 = teams.find(t => t.id === m.team1Id);
                    const t2 = teams.find(t => t.id === m.team2Id);
                    if (!t1 || !t2) return null;
                    
                    let resultSpan = "";
                    if (m.runs1 > m.runs2) {
                      resultSpan = `${t1.abbv} won by ${m.runs1 - m.runs2} runs`;
                    } else if (m.runs2 > m.runs1) {
                      resultSpan = `${t2.abbv} won by ${10 - m.wickets2} wickets`;
                    } else {
                      resultSpan = "Match Tied";
                    }

                    return (
                      <div key={m.id} className="activity-item">
                        <div className="activity-icon" style={{ backgroundColor: "rgba(128, 200, 176, 0.1)", color: "var(--accent-cyan)" }}>
                          <Swords style={{ width: 16, height: 16 }} />
                        </div>
                        <div className="activity-details">
                          <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{t1.name} vs {t2.name}</div>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{resultSpan}</span>
                        </div>
                      </div>
                    );
                  })}
                  {matches.length === 0 && (
                    <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
                      No matches played yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- VIEW 2: PLAYERS VIEW --- */}
        {activeView === "players" && (
          <section className="view-pane active">
            
            {/* Filter and Search Bar */}
            <div className="filter-bar">
              <div className="search-wrapper">
                <Search />
                <input 
                  type="text" 
                  className="form-control search-input" 
                  placeholder="Search players by name..." 
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                />
              </div>
              <div className="filter-groups">
                <select className="form-control" value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)} style={{ minWidth: 150 }}>
                  <option value="all">All Teams</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <select className="form-control" value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ minWidth: 150 }}>
                  <option value="all">All Roles</option>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicketkeeper">Wicketkeeper</option>
                </select>
              </div>
            </div>

            {/* Players Grid */}
            <div className="player-grid">
              {filteredPlayersList.map(p => {
                const team = teams.find(t => t.id === p.teamId);
                const teamName = team ? team.name : "Unassigned";
                const teamColor = team ? team.color : "#06b6d4";

                return (
                  <div key={p.id} className="player-card" style={{ ["--jersey-color" as any]: p.jerseyColor || teamColor }}>
                    <div className="player-card-content">
                      <div className="player-avatar-container">
                        <Jersey color={p.jerseyColor || teamColor} number={p.jerseyNum} />
                        <div className="player-card-role-badge" title={p.role}>
                          {getRoleIcon(p.role)}
                        </div>
                      </div>
                      <h3 className="player-card-name">{p.name}</h3>
                      <span className="player-card-team" style={{ color: teamColor, fontWeight: 600 }}>{teamName}</span>
                      
                      <div className="player-quick-stats">
                        <div className="quick-stat-item">
                          <span className="quick-stat-val" style={{ color: "var(--accent-cyan)" }}>{p.matches}</span>
                          <span className="quick-stat-lbl">Mat</span>
                        </div>
                        <div className="quick-stat-item">
                          <span className="quick-stat-val" style={{ color: "var(--accent-emerald)" }}>{p.runs}</span>
                          <span className="quick-stat-lbl">Runs</span>
                        </div>
                        <div className="quick-stat-item">
                          <span className="quick-stat-val" style={{ color: "var(--accent-amber)" }}>{p.wickets}</span>
                          <span className="quick-stat-lbl">Wkts</span>
                        </div>
                      </div>

                      <div className="player-actions">
                        <button className="btn btn-secondary" onClick={() => openPlayerDetailModal(p.id)}>View Profile</button>
                        <button className="btn btn-primary" onClick={() => openEditPlayerModal(p.id)} style={{ padding: "0.5rem" }}>
                          <Edit3 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredPlayersList.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
                  <Users style={{ width: 48, height: 48, marginBottom: "1rem", opacity: 0.5, marginLeft: "auto", marginRight: "auto" }} />
                  <p>No players match the search criteria.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* --- VIEW 3: TEAMS VIEW --- */}
        {activeView === "teams" && (
          <section className="view-pane active">
            <div className="team-list-grid">
              {teams.map(team => {
                const roster = players.filter(p => p.teamId === team.id);
                const batsmen = roster.filter(p => p.role === "Batsman" || p.role === "Wicketkeeper").length;
                const bowlers = roster.filter(p => p.role === "Bowler").length;
                const allrounders = roster.filter(p => p.role === "All-Rounder").length;

                const standing = standings.find(s => s.id === team.id) || { played: 0, won: 0, lost: 0, points: 0 };

                return (
                  <div key={team.id} className="team-card">
                    <div className="team-card-header">
                      <span className="team-card-color" style={{ color: team.color, backgroundColor: team.color }}></span>
                      <h3 className="team-card-name">{team.abbv ? `${team.name} (${team.abbv})` : team.name}</h3>
                    </div>
                    
                    <div className="team-stats-flex">
                      <div className="team-stat-row">
                        <span>Roster Size</span>
                        <span>{roster.length} Players</span>
                      </div>
                      <div className="team-stat-row">
                        <span>Batsmen / Bowlers / All-Rounders</span>
                        <span>{batsmen} / {bowlers} / {allrounders}</span>
                      </div>
                      <div className="team-stat-row" style={{ marginTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "0.5rem" }}>
                        <span>Matches Played</span>
                        <span>{standing.played}</span>
                      </div>
                      <div className="team-stat-row">
                        <span>Wins / Losses</span>
                        <span style={{ color: "var(--accent-emerald)" }}>{standing.won} <span style={{ color: "var(--text-secondary)" }}>-</span> <span style={{ color: "var(--accent-rose)" }}>{standing.lost}</span></span>
                      </div>
                      <div className="team-stat-row">
                        <span>League Points</span>
                        <span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>{standing.points} Pts</span>
                      </div>
                    </div>

                    <button className="btn btn-secondary" onClick={() => handleViewTeamRoster(team.id)} style={{ marginTop: "auto", width: "100%", justifyContent: "center" }}>
                      <Eye style={{ width: 16, height: 16 }} />
                      <span>View Roster</span>
                    </button>
                  </div>
                );
              })}
              {teams.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
                  No teams registered.
                </div>
              )}
            </div>
          </section>
        )}

        {/* --- VIEW 4: MATCH CENTER / FIXTURES VIEW --- */}
        {activeView === "fixtures" && (
          <section className="view-pane active">
            <div className="dashboard-layout">
              {/* Match Entry Form */}
              <div className="glass-card">
                <div className="card-header">
                  <h3>
                    <Swords style={{ color: "var(--accent-cyan)" }} />
                    Submit Match Score
                  </h3>
                </div>
                <form onSubmit={handleMatchSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Team 1</label>
                      <select 
                        className="form-control" 
                        value={matchForm.team1Id} 
                        onChange={(e) => setMatchForm({ ...matchForm, team1Id: e.target.value })} 
                        required
                      >
                        <option value="" disabled>Select Team 1</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Team 2</label>
                      <select 
                        className="form-control" 
                        value={matchForm.team2Id} 
                        onChange={(e) => setMatchForm({ ...matchForm, team2Id: e.target.value })} 
                        required
                      >
                        <option value="" disabled>Select Team 2</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Team 1 Score (Runs / Wickets)</label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input 
                          type="number" 
                          className="form-control" 
                          placeholder="Runs" 
                          min="0" 
                          value={matchForm.runs1} 
                          onChange={(e) => setMatchForm({ ...matchForm, runs1: e.target.value })} 
                          required 
                          style={{ width: "60%" }}
                        />
                        <input 
                          type="number" 
                          className="form-control" 
                          placeholder="Wkts" 
                          min="0" 
                          max="10" 
                          value={matchForm.wickets1} 
                          onChange={(e) => setMatchForm({ ...matchForm, wickets1: e.target.value })} 
                          required 
                          style={{ width: "40%" }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Team 2 Score (Runs / Wickets)</label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input 
                          type="number" 
                          className="form-control" 
                          placeholder="Runs" 
                          min="0" 
                          value={matchForm.runs2} 
                          onChange={(e) => setMatchForm({ ...matchForm, runs2: e.target.value })} 
                          required 
                          style={{ width: "60%" }}
                        />
                        <input 
                          type="number" 
                          className="form-control" 
                          placeholder="Wkts" 
                          min="0" 
                          max="10" 
                          value={matchForm.wickets2} 
                          onChange={(e) => setMatchForm({ ...matchForm, wickets2: e.target.value })} 
                          required 
                          style={{ width: "40%" }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Team 1 Overs Played</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="Overs (e.g. 20)" 
                        min="0.1" 
                        step="0.1" 
                        max="20" 
                        value={matchForm.overs1} 
                        onChange={(e) => setMatchForm({ ...matchForm, overs1: e.target.value })} 
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Team 2 Overs Played</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="Overs (e.g. 20)" 
                        min="0.1" 
                        step="0.1" 
                        max="20" 
                        value={matchForm.overs2} 
                        onChange={(e) => setMatchForm({ ...matchForm, overs2: e.target.value })} 
                        required
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Match Notes (Optional)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Semi Final, Warmup match..." 
                        value={matchForm.notes} 
                        onChange={(e) => setMatchForm({ ...matchForm, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                    <button type="reset" className="btn btn-secondary" onClick={() => setMatchForm({
                      team1Id: "", team2Id: "", runs1: "", wickets1: "", overs1: "", runs2: "", wickets2: "", overs2: "", notes: ""
                    })}>Clear</button>
                    <button type="submit" className="btn btn-primary">
                      <CheckCircle2 style={{ width: 18, height: 18 }} />
                      <span>Record Result</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* All Matches Log */}
              <div className="glass-card">
                <div className="card-header">
                  <h3>
                    <History style={{ color: "var(--accent-emerald)" }} />
                    Fixture Log
                  </h3>
                  <button className="btn btn-danger" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }} onClick={handleResetMatches}>Reset Log</button>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Match</th>
                        <th style={{ textAlign: "right" }}>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matches.slice().reverse().map(m => {
                        const t1 = teams.find(t => t.id === m.team1Id);
                        const t2 = teams.find(t => t.id === m.team2Id);
                        if (!t1 || !t2) return null;

                        let resultText: React.ReactNode = "";
                        if (m.runs1 > m.runs2) {
                          resultText = <span><span style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>{t1.abbv} won</span> by {m.runs1 - m.runs2} runs</span>;
                        } else if (m.runs2 > m.runs1) {
                          const wicketsLeft = 10 - m.wickets2;
                          resultText = <span><span style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>{t2.abbv} won</span> by {wicketsLeft} wickets</span>;
                        } else {
                          resultText = <span style={{ color: "var(--accent-amber)", fontWeight: 600 }}>Match Tied</span>;
                        }

                        return (
                          <tr key={m.id}>
                            <td>
                              <div style={{ fontWeight: 600, fontFamily: "var(--font-display)" }}>{t1.name} <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "0.8rem" }}>vs</span> {t2.name}</div>
                              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                                {t1.abbv}: {m.runs1}/{m.wickets1} ({m.overs1} ov) &bull; {t2.abbv}: {m.runs2}/{m.wickets2} ({m.overs2} ov)
                              </div>
                            </td>
                            <td style={{ textAlign: "right", verticalAlign: "middle" }}>
                              <div style={{ fontSize: "0.85rem" }}>{resultText}</div>
                              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic", marginTop: "0.2rem" }}>{m.notes || "Season Match"}</div>
                            </td>
                          </tr>
                        );
                      })}
                      {matches.length === 0 && (
                        <tr>
                          <td colSpan={2} style={{ textAlign: "center", color: "var(--text-muted)" }}>No fixtures recorded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- VIEW 5: DATABASE CONNECTION VIEW --- */}
        {activeView === "database" && (
          <section className="view-pane active">
            <div className="glass-card" style={{ maxWidth: 600, margin: "2rem auto" }}>
              <div className="card-header">
                <h3>
                  <Database style={{ color: "var(--accent-cyan)" }} />
                  Database Connection
                </h3>
              </div>
              
              <div className="sync-card-body" style={{ padding: "1.5rem" }}>
                <p style={{ marginBottom: "1.5rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  All data is stored in a PostgreSQL database. Changes made on any device are automatically reflected everywhere.
                  All database operations run securely on the server — no credentials are exposed to the client.
                </p>

                {/* Connection Status */}
                <div style={{ background: dbStatus === "connected" ? "rgba(16, 185, 129, 0.05)" : dbStatus === "connecting" ? "rgba(245, 158, 11, 0.05)" : "rgba(239, 68, 68, 0.05)", border: `1px solid ${dbStatus === "connected" ? "rgba(16, 185, 129, 0.15)" : dbStatus === "connecting" ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)"}`, padding: "1.25rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {dbStatus === "connected" ? (
                        <Wifi style={{ color: "var(--accent-emerald)" }} />
                      ) : (
                        <WifiOff style={{ color: dbStatus === "connecting" ? "var(--accent-amber)" : "var(--accent-rose)" }} />
                      )}
                      <h4 style={{ color: "var(--text-primary)", margin: 0 }}>
                        {dbStatus === "connected" && "Database Connected"}
                        {dbStatus === "connecting" && "Connecting to Database..."}
                        {dbStatus === "error" && "Database Connection Error"}
                        {dbStatus === "no-config" && "Database Not Configured"}
                      </h4>
                    </div>
                    <span className={`badge ${dbStatus === "connected" ? "badge-emerald" : dbStatus === "connecting" ? "badge-amber" : "badge-rose"}`}>
                      {dbStatus === "connected" ? "Live" : dbStatus === "connecting" ? "Connecting" : dbStatus === "no-config" ? "Demo Mode" : "Error"}
                    </span>
                  </div>
                  
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    {dbStatus === "connected" && "Your PostgreSQL database is online. All changes are persisted automatically across all devices."}
                    {dbStatus === "connecting" && "Establishing connection to your PostgreSQL database..."}
                    {dbStatus === "error" && (dbError || "Could not connect to the database. Please check your DATABASE_URL configuration.")}
                    {dbStatus === "no-config" && "No DATABASE_URL environment variable found. Running with demo data. Set DATABASE_URL in your .env.local to connect to PostgreSQL."}
                  </p>

                  {dbError && dbStatus === "error" && (
                    <div style={{ background: "rgba(239, 68, 68, 0.08)", padding: "0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", fontFamily: "monospace", color: "var(--accent-rose)", marginBottom: "1rem", wordBreak: "break-all" }}>
                      {dbError}
                    </div>
                  )}
                </div>

                {/* Data Statistics */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", padding: "1.25rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
                  <h4 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)" }}>
                    <Info style={{ color: "var(--accent-cyan)", width: 18, height: 18 }} />
                    Data Statistics
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                    <div style={{ textAlign: "center", padding: "0.75rem", background: "rgba(6, 182, 212, 0.05)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(6, 182, 212, 0.1)" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent-cyan)" }}>{teams.length}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Teams</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "0.75rem", background: "rgba(16, 185, 129, 0.05)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(16, 185, 129, 0.1)" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent-emerald)" }}>{players.length}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Players</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "0.75rem", background: "rgba(245, 158, 11, 0.05)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(245, 158, 11, 0.1)" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent-amber)" }}>{matches.length}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Matches</div>
                    </div>
                  </div>
                </div>

                {/* Refresh Button */}
                <div style={{ display: "flex", gap: "1rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
                  <button className="btn btn-secondary" style={{ fontSize: "0.875rem" }} onClick={async () => {
                    showToast("Refreshing data from database...", "info");
                    await refreshData();
                    showToast("Data refreshed successfully!");
                  }}>
                    <RefreshCw style={{ width: 16, height: 16 }} />
                    <span>Refresh Data</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* --- MODAL 1: PLAYER REGISTRATION / EDIT --- */}
      {playerModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-box">
            <button className="modal-close-btn" onClick={() => setPlayerModalOpen(false)}>&times;</button>
            <div className="modal-title">
              <h3>
                {editingPlayerId ? (
                  <>
                    <Edit style={{ color: "var(--accent-cyan)", display: "inline-block", marginRight: "0.5rem" }} />
                    Edit Player Profile
                  </>
                ) : (
                  <>
                    <UserPlus style={{ color: "var(--accent-cyan)", display: "inline-block", marginRight: "0.5rem" }} />
                    Register Player
                  </>
                )}
              </h3>
            </div>
            <form onSubmit={handlePlayerSubmit}>
              <div className="form-grid">
                
                <div className="form-group full-width">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter player's first and last name" 
                    value={playerForm.name}
                    onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Age *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Age" 
                    min="15" 
                    max="50" 
                    value={playerForm.age}
                    onChange={(e) => setPlayerForm({ ...playerForm, age: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Team Assignment *</label>
                  <select 
                    className="form-control" 
                    value={playerForm.teamId}
                    onChange={(e) => setPlayerForm({ ...playerForm, teamId: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Specialist Role *</label>
                  <select 
                    className="form-control" 
                    value={playerForm.role}
                    onChange={(e) => setPlayerForm({ ...playerForm, role: e.target.value as Player["role"] })}
                    required
                  >
                    <option value="" disabled>Select Role</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Wicketkeeper">Wicketkeeper-Batsman</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Jersey Number *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Jersey #" 
                    min="1" 
                    max="999" 
                    value={playerForm.jerseyNum}
                    onChange={(e) => setPlayerForm({ ...playerForm, jerseyNum: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Batting Style *</label>
                  <select 
                    className="form-control" 
                    value={playerForm.battingStyle}
                    onChange={(e) => setPlayerForm({ ...playerForm, battingStyle: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select Batting Style</option>
                    <option value="Right-Handed">Right-Handed</option>
                    <option value="Left-Handed">Left-Handed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Bowling Style</label>
                  <select 
                    className="form-control" 
                    value={playerForm.bowlingStyle}
                    onChange={(e) => setPlayerForm({ ...playerForm, bowlingStyle: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select Bowling Style</option>
                    <option value="None">None / Does not bowl</option>
                    <option value="Right-Arm Fast">Right-Arm Fast</option>
                    <option value="Right-Arm Medium">Right-Arm Medium</option>
                    <option value="Right-Arm Spin">Right-Arm Spin (Off/Leg)</option>
                    <option value="Left-Arm Fast">Left-Arm Fast</option>
                    <option value="Left-Arm Spin">Left-Arm Spin</option>
                  </select>
                </div>

                {/* Stats Block (Optional / Quick Entry) */}
                <div className="form-group full-width" style={{ marginTop: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                  <label style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>Player Statistics (Career/Season)</label>
                </div>

                <div className="form-group">
                  <label>Matches Played</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    min="0" 
                    value={playerForm.matches}
                    onChange={(e) => setPlayerForm({ ...playerForm, matches: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Runs Scored</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    min="0" 
                    value={playerForm.runs}
                    onChange={(e) => setPlayerForm({ ...playerForm, runs: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>High Score</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    min="0" 
                    value={playerForm.highScore}
                    onChange={(e) => setPlayerForm({ ...playerForm, highScore: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Wickets Taken</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    min="0" 
                    value={playerForm.wickets}
                    onChange={(e) => setPlayerForm({ ...playerForm, wickets: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Best Bowling (Runs conceded)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    min="0" 
                    value={playerForm.bestBowlingRuns}
                    onChange={(e) => setPlayerForm({ ...playerForm, bestBowlingRuns: e.target.value })}
                    style={{ marginBottom: "0.5rem" }}
                  />
                </div>
                <div className="form-group">
                  <label>Best Bowling (Wickets taken)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    min="0" 
                    max="10" 
                    value={playerForm.bestBowlingWkts}
                    onChange={(e) => setPlayerForm({ ...playerForm, bestBowlingWkts: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Jersey Theme Accent Color</label>
                  <div className="jersey-picker">
                    {["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"].map((colorVal) => (
                      <label key={colorVal} className="jersey-option" style={{ color: colorVal }}>
                        <input 
                          type="radio" 
                          name="jersey-theme" 
                          value={colorVal} 
                          checked={playerForm.jerseyColor === colorVal}
                          onChange={(e) => setPlayerForm({ ...playerForm, jerseyColor: e.target.value })}
                        />
                        <div className="jersey-visual" style={{ background: `rgba(${colorVal === "#3b82f6" ? "59, 130, 246" : colorVal === "#ef4444" ? "239, 68, 68" : colorVal === "#10b981" ? "16, 185, 129" : colorVal === "#f59e0b" ? "245, 158, 11" : "139, 92, 246"}, 0.2)`, color: colorVal }}>
                          {colorVal === "#3b82f6" ? "🔵" : colorVal === "#ef4444" ? "🔴" : colorVal === "#10b981" ? "🟢" : colorVal === "#f59e0b" ? "🟡" : "🟣"}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setPlayerModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 style={{ width: 18, height: 18 }} />
                  <span>Save Player</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: TEAM CREATION --- */}
      {teamModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-box">
            <button className="modal-close-btn" onClick={() => setTeamModalOpen(false)}>&times;</button>
            <div className="modal-title">
              <h3>
                <PlusCircle style={{ color: "var(--accent-cyan)", display: "inline-block", marginRight: "0.5rem" }} />
                Create New Team
              </h3>
            </div>
            <form onSubmit={handleTeamSubmit}>
              <div className="form-grid">
                
                <div className="form-group full-width">
                  <label>Team Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Royal Challengers, Mumbai Titans" 
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Team Abbreviation (3-4 Letters) *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. RCB, MMT" 
                    maxLength={4} 
                    value={teamForm.abbv}
                    onChange={(e) => setTeamForm({ ...teamForm, abbv: e.target.value.toUpperCase() })}
                    style={{ textTransform: "uppercase" }} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Primary Accent Color *</label>
                  <input 
                    type="color" 
                    className="form-control" 
                    value={teamForm.color}
                    onChange={(e) => setTeamForm({ ...teamForm, color: e.target.value })}
                    style={{ padding: "0.25rem 0.5rem", height: 45, width: "100%" }} 
                    required 
                  />
                </div>

              </div>

              <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setTeamModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 style={{ width: 18, height: 18 }} />
                  <span>Add Team</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: PLAYER DETAILS PROFILE --- */}
      {playerDetailModalOpen && detailPlayerData && (
        <div className="modal-overlay active">
          <div className="modal-box" style={{ width: 550 }}>
            <button className="modal-close-btn" onClick={() => setPlayerDetailModalOpen(false)}>&times;</button>
            
            <div className="detail-modal-layout">
              {/* Jersey Avatar + Name summary */}
              <div className="detail-player-header">
                <div>
                  <Jersey color={detailPlayerData.player.jerseyColor || detailPlayerData.team?.color || "#06b6d4"} number={detailPlayerData.player.jerseyNum} />
                </div>
                <div className="detail-player-summary">
                  <h4>{detailPlayerData.player.name}</h4>
                  <p>{detailPlayerData.player.role} &bull; {detailPlayerData.team?.name || "Unassigned"}</p>
                  <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                    <span className="badge badge-cyan">{detailPlayerData.player.battingStyle}</span>
                    {detailPlayerData.player.bowlingStyle !== "None" && (
                      <span className="badge badge-emerald">{detailPlayerData.player.bowlingStyle}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Capability Stat Bars */}
              <div className="stat-bars-container">
                {/* Batting rating */}
                <div className="stat-bar-group">
                  <div className="stat-bar-label">
                    <span>Batting Prowess</span>
                    <span>{detailPlayerData.battingRating}%</span>
                  </div>
                  <div className="stat-bar-track">
                    <div className="stat-bar-fill" style={{ width: `${detailPlayerData.battingRating}%` }}></div>
                  </div>
                </div>

                {/* Bowling rating */}
                <div className="stat-bar-group">
                  <div className="stat-bar-label">
                    <span>Bowling Prowess</span>
                    <span>{detailPlayerData.bowlingRating}%</span>
                  </div>
                  <div className="stat-bar-track">
                    <div className="stat-bar-fill" style={{ width: `${detailPlayerData.bowlingRating}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Career statistics grids */}
              <div className="detail-metrics-grid">
                <div className="detail-metric-card">
                  <h5>Matches</h5>
                  <p>{detailPlayerData.player.matches}</p>
                </div>
                <div className="detail-metric-card">
                  <h5>Total Runs</h5>
                  <p>{detailPlayerData.player.runs}</p>
                </div>
                <div className="detail-metric-card">
                  <h5>Batting Average</h5>
                  <p>{detailPlayerData.battingAvg}</p>
                </div>
                <div className="detail-metric-card">
                  <h5>High Score</h5>
                  <p>{detailPlayerData.player.highScore}</p>
                </div>
                <div className="detail-metric-card">
                  <h5>Wickets</h5>
                  <p>{detailPlayerData.player.wickets}</p>
                </div>
                <div className="detail-metric-card">
                  <h5>Best Bowling</h5>
                  <p>
                    {detailPlayerData.player.bestBowlingWkts > 0 
                      ? `${detailPlayerData.player.bestBowlingWkts}/${detailPlayerData.player.bestBowlingRuns}` 
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                <button className="btn btn-secondary" style={{ flexGrow: 1, justifyContent: "center" }} onClick={() => openEditPlayerModal(detailPlayerData.player.id)}>
                  <Edit style={{ width: 16, height: 16 }} />
                  <span>Edit Profile</span>
                </button>
                <button className="btn btn-danger" style={{ flexGrow: 1, justifyContent: "center" }} onClick={() => handleDeletePlayer(detailPlayerData.player.id)}>
                  <Trash2 style={{ width: 16, height: 16 }} />
                  <span>Delete Player</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
