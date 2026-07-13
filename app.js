// Cricket League Management Application - State & Controller

// 1. Initial State Data (Mock Data for instant preview)
const defaultTeams = [
  { id: "team-1", name: "Palamaner", abbv: "", color: "#3b82f6" },
  { id: "team-2", name: "Chittoor", abbv: "", color: "#ef4444" },
  { id: "team-3", name: "Tirupati", abbv: "", color: "#f59e0b" },
  { id: "team-4", name: "Punganur", abbv: "", color: "#10b981" }
];

const defaultPlayers = [
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

const defaultMatches = [
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
    notes: "Mumbai Mavericks won by 8 wickets in a high scoring chase."
  },
  {
    id: "match-2",
    team3Id: "team-3",
    team2Id: "team-2",
    runs1: 155,
    wickets1: 8,
    overs1: 20.0,
    runs2: 140,
    wickets2: 10,
    overs2: 18.4,
    notes: "Stallions defend 155 with excellent bowling display."
  }
];

// 2. Global State Handler
let state = {
  teams: JSON.parse(localStorage.getItem("clm_teams")) || defaultTeams,
  players: JSON.parse(localStorage.getItem("clm_players")) || defaultPlayers,
  matches: JSON.parse(localStorage.getItem("clm_matches")) || defaultMatches
};

// Save helper
function saveState() {
  localStorage.setItem("clm_teams", JSON.stringify(state.teams));
  localStorage.setItem("clm_players", JSON.stringify(state.players));
  localStorage.setItem("clm_matches", JSON.stringify(state.matches));
  renderApp();
  syncPushState();
}

// Cloud Sync State Manager
function updateSyncIndicator(status) {
  const dot = document.getElementById("sidebar-sync-dot");
  const badge = document.getElementById("sync-status-badge");
  
  if (!dot) return;
  
  // Clear status classes
  dot.className = "sync-dot";
  
  if (status === "offline") {
    dot.classList.add("status-offline");
    if (badge) {
      badge.textContent = "Offline (Local)";
      badge.className = "badge btn-secondary";
    }
  } else if (status === "syncing") {
    dot.classList.add("status-syncing");
    if (badge) {
      badge.textContent = "Syncing...";
      badge.className = "badge badge-amber";
    }
  } else if (status === "synced") {
    dot.classList.add("status-synced");
    if (badge) {
      badge.textContent = "Synced";
      badge.className = "badge badge-emerald";
    }
  } else if (status === "error") {
    dot.classList.add("status-error");
    if (badge) {
      badge.textContent = "Sync Error";
      badge.className = "badge btn-danger";
    }
  }
}

async function syncPushState() {
  const syncKey = localStorage.getItem("clm_sync_key");
  if (!syncKey) {
    updateSyncIndicator("offline");
    return;
  }
  
  updateSyncIndicator("syncing");
  try {
    const payload = {
      teams: state.teams,
      players: state.players,
      matches: state.matches,
      updatedAt: Date.now()
    };
    
    const response = await fetch(`https://jsonblob.com/api/jsonBlob/${syncKey}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      updateSyncIndicator("synced");
    } else {
      updateSyncIndicator("error");
    }
  } catch (error) {
    console.error("Sync error:", error);
    updateSyncIndicator("error");
  }
}

async function syncPullState() {
  const syncKey = localStorage.getItem("clm_sync_key");
  if (!syncKey) return false;
  
  updateSyncIndicator("syncing");
  try {
    const response = await fetch(`https://jsonblob.com/api/jsonBlob/${syncKey}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.teams && data.players && data.matches) {
        state.teams = data.teams;
        state.players = data.players;
        state.matches = data.matches;
        
        localStorage.setItem("clm_teams", JSON.stringify(state.teams));
        localStorage.setItem("clm_players", JSON.stringify(state.players));
        localStorage.setItem("clm_matches", JSON.stringify(state.matches));
        
        updateSyncIndicator("synced");
        return true;
      }
    }
    updateSyncIndicator("error");
    return false;
  } catch (error) {
    console.error("Pull state error:", error);
    updateSyncIndicator("error");
    return false;
  }
}

async function enableCloudSync() {
  updateSyncIndicator("syncing");
  try {
    const payload = {
      teams: state.teams,
      players: state.players,
      matches: state.matches,
      updatedAt: Date.now()
    };
    
    const response = await fetch("https://jsonblob.com/api/jsonBlob", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      const location = response.headers.get("Location");
      if (location) {
        const syncKey = location.substring(location.lastIndexOf("/") + 1);
        localStorage.setItem("clm_sync_key", syncKey);
        updateSyncIndicator("synced");
        showToast("Cloud sync enabled successfully!");
        renderSyncSettings();
      } else {
        updateSyncIndicator("error");
        showToast("Failed to enable sync: Location header missing", "error");
      }
    } else {
      updateSyncIndicator("error");
      showToast("Failed to enable sync on server", "error");
    }
  } catch (error) {
    console.error("Enable sync error:", error);
    updateSyncIndicator("error");
    showToast("Network error trying to enable sync", "error");
  }
}

async function joinCloudSync(syncKey) {
  if (!syncKey || syncKey.trim().length === 0) {
    showToast("Please enter a valid Sync Code", "error");
    return;
  }
  
  updateSyncIndicator("syncing");
  try {
    const response = await fetch(`https://jsonblob.com/api/jsonBlob/${syncKey.trim()}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.teams && data.players && data.matches) {
        state.teams = data.teams;
        state.players = data.players;
        state.matches = data.matches;
        
        localStorage.setItem("clm_sync_key", syncKey.trim());
        localStorage.setItem("clm_teams", JSON.stringify(state.teams));
        localStorage.setItem("clm_players", JSON.stringify(state.players));
        localStorage.setItem("clm_matches", JSON.stringify(state.matches));
        
        updateSyncIndicator("synced");
        showToast("Successfully joined sync session!");
        renderApp();
        renderSyncSettings();
      } else {
        updateSyncIndicator("error");
        showToast("Invalid sync code or sync data is corrupted", "error");
      }
    } else {
      updateSyncIndicator("error");
      showToast("Sync Code not found on server", "error");
    }
  } catch (error) {
    console.error("Join sync error:", error);
    updateSyncIndicator("error");
    showToast("Network error trying to join sync session", "error");
  }
}

function disconnectCloudSync() {
  if (confirm("Are you sure you want to disconnect? Your data will remain local to this device, but will stop syncing with other devices.")) {
    localStorage.removeItem("clm_sync_key");
    updateSyncIndicator("offline");
    showToast("Cloud sync disconnected.", "info");
    renderSyncSettings();
  }
}

function renderSyncSettings() {
  const syncKey = localStorage.getItem("clm_sync_key");
  const inactivePane = document.getElementById("sync-inactive-pane");
  const activePane = document.getElementById("sync-active-pane");
  const displayCode = document.getElementById("display-sync-code");
  
  if (syncKey) {
    if (inactivePane) inactivePane.classList.add("hidden");
    if (activePane) activePane.classList.remove("hidden");
    if (displayCode) displayCode.textContent = syncKey;
    updateSyncIndicator("synced");
  } else {
    if (inactivePane) inactivePane.classList.remove("hidden");
    if (activePane) activePane.classList.add("hidden");
    updateSyncIndicator("offline");
  }
}

function setupSyncEventListeners() {
  const btnEnable = document.getElementById("btn-enable-sync");
  const btnJoin = document.getElementById("btn-join-sync");
  const btnDisconnect = document.getElementById("btn-disconnect-sync");
  const btnSyncNow = document.getElementById("btn-sync-now");
  const btnCopy = document.getElementById("btn-copy-sync-code");
  
  if (btnEnable) {
    btnEnable.addEventListener("click", enableCloudSync);
  }
  
  if (btnJoin) {
    btnJoin.addEventListener("click", () => {
      const input = document.getElementById("sync-code-input");
      if (input && input.value) {
        if (confirm("Warning: Joining a sync session will overwrite your current local teams and players data with the cloud data. Proceed?")) {
          joinCloudSync(input.value);
        }
      } else {
        showToast("Please enter a Sync Code", "error");
      }
    });
  }
  
  if (btnDisconnect) {
    btnDisconnect.addEventListener("click", disconnectCloudSync);
  }
  
  if (btnSyncNow) {
    btnSyncNow.addEventListener("click", async () => {
      showToast("Syncing latest data...", "info");
      const pulled = await syncPullState();
      if (pulled) {
        renderApp();
        showToast("Data pulled and updated from cloud!");
      } else {
        showToast("Could not retrieve latest data. Pushing local state to cloud...", "info");
        await syncPushState();
      }
    });
  }
  
  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const syncKey = localStorage.getItem("clm_sync_key");
      if (syncKey) {
        navigator.clipboard.writeText(syncKey)
          .then(() => showToast("Sync Code copied to clipboard!"))
          .catch(() => showToast("Failed to copy code", "error"));
      }
    });
  }
}

// 3. UI Helpers: Toasts
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  let iconName = "check-circle";
  if (type === "error") iconName = "alert-circle";
  if (type === "info") iconName = "info";
  
  toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  lucide.createIcons();
  
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// 4. UI Helper: Jersey SVG Generator
function getJerseySVG(color, number = "00") {
  return `
    <svg viewBox="0 0 100 100" class="player-jersey-svg">
      <!-- Sleeve Right -->
      <path d="M68 22 L88 36 L78 48 L68 38 Z" fill="${color}" opacity="0.9" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
      <!-- Sleeve Left -->
      <path d="M32 22 L12 36 L22 48 L32 38 Z" fill="${color}" opacity="0.9" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
      <!-- Jersey Body -->
      <path d="M32 22 L68 22 L68 84 L32 84 Z" fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
      <!-- Jersey Trim/Details -->
      <path d="M42 22 L50 32 L58 22" fill="none" stroke="#ffffff" stroke-width="2.5"/>
      <path d="M32 84 L68 84" stroke="rgba(0,0,0,0.3)" stroke-width="4"/>
      <!-- Number -->
      <text x="50" y="58" font-family="'Outfit', sans-serif" font-size="22" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="-1">${number}</text>
    </svg>
  `;
}

// 5. Views Management
const viewTitles = {
  dashboard: { title: "Dashboard Overview", subtitle: "Real-time league standings, recent match results, and active teams." },
  players: { title: "Player Directory", subtitle: "Search, filter, and review player statistics and profiles." },
  teams: { title: "Team Rosters", subtitle: "Manage league franchises and evaluate team composition." },
  fixtures: { title: "Match Center", subtitle: "Record scores and review league match results." },
  sync: { title: "Cloud Synchronization", subtitle: "Synchronize teams, players, and match records across multiple devices." }
};

document.querySelectorAll(".nav-menu .nav-item").forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const view = item.getAttribute("data-view");
    
    // Toggle Nav items
    document.querySelectorAll(".nav-menu .nav-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    
    // Toggle Views
    document.querySelectorAll(".view-pane").forEach(pane => pane.classList.remove("active"));
    document.getElementById(`view-${view}`).classList.add("active");
    
    // Update titles
    document.getElementById("view-title").innerText = viewTitles[view].title;
    document.getElementById("view-subtitle").innerText = viewTitles[view].subtitle;
    
    // Render specific view assets
    if (view === "players") renderPlayersList();
    if (view === "teams") renderTeamsList();
    if (view === "sync") renderSyncSettings();
  });
});

// Navigate helper from Dashboard to Fixtures
document.getElementById("nav-to-match-center").addEventListener("click", () => {
  const matchCenterTab = document.querySelector(".nav-menu .nav-item[data-view='fixtures']");
  if (matchCenterTab) matchCenterTab.click();
});

// 6. Modal Functions
function openModal(modalId) {
  document.getElementById(modalId).classList.add("active");
}
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// Modal triggers
document.getElementById("btn-add-player-trigger").addEventListener("click", () => {
  document.getElementById("player-registration-form").reset();
  document.getElementById("edit-player-id").value = "";
  document.getElementById("player-modal-title-text").innerHTML = `<i data-lucide="user-plus" style="color: var(--accent-cyan)"></i> Register Player`;
  
  // Populate dropdowns
  populateTeamDropdowns();
  openModal("modal-player-registration");
  lucide.createIcons();
});

document.getElementById("btn-add-team-trigger").addEventListener("click", () => {
  document.getElementById("team-creation-form").reset();
  openModal("modal-team-creation");
});

// Close buttons
document.getElementById("modal-player-close").addEventListener("click", () => closeModal("modal-player-registration"));
document.getElementById("btn-player-cancel").addEventListener("click", () => closeModal("modal-player-registration"));

document.getElementById("modal-team-close").addEventListener("click", () => closeModal("modal-team-creation"));
document.getElementById("btn-team-cancel").addEventListener("click", () => closeModal("modal-team-creation"));

document.getElementById("modal-detail-close").addEventListener("click", () => closeModal("modal-player-detail"));

// Close modals when clicking overlay
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active");
  }
});

// Populate Select Dropdowns
function populateTeamDropdowns() {
  const playerTeamSelect = document.getElementById("player-team");
  const matchTeam1Select = document.getElementById("match-team-1");
  const matchTeam2Select = document.getElementById("match-team-2");
  const filterTeamSelect = document.getElementById("filter-team");
  
  // Save current selections
  const selectedPlayerTeam = playerTeamSelect.value;
  const selectedTeam1 = matchTeam1Select.value;
  const selectedTeam2 = matchTeam2Select.value;
  const selectedFilter = filterTeamSelect.value;

  // Reset innerHTMLs
  playerTeamSelect.innerHTML = `<option value="" disabled selected>Select Team</option>`;
  matchTeam1Select.innerHTML = `<option value="" disabled selected>Select Team 1</option>`;
  matchTeam2Select.innerHTML = `<option value="" disabled selected>Select Team 2</option>`;
  filterTeamSelect.innerHTML = `<option value="all">All Teams</option>`;

  state.teams.forEach(team => {
    const label = team.abbv ? `${team.name} (${team.abbv})` : team.name;
    const opt = `<option value="${team.id}">${label}</option>`;
    playerTeamSelect.innerHTML += opt;
    matchTeam1Select.innerHTML += opt;
    matchTeam2Select.innerHTML += opt;
    filterTeamSelect.innerHTML += opt;
  });

  // Restore selections if valid
  if (selectedPlayerTeam && state.teams.some(t => t.id === selectedPlayerTeam)) playerTeamSelect.value = selectedPlayerTeam;
  if (selectedTeam1 && state.teams.some(t => t.id === selectedTeam1)) matchTeam1Select.value = selectedTeam1;
  if (selectedTeam2 && state.teams.some(t => t.id === selectedTeam2)) matchTeam2Select.value = selectedTeam2;
  if (selectedFilter && (selectedFilter === "all" || state.teams.some(t => t.id === selectedFilter))) filterTeamSelect.value = selectedFilter;
}


// 7. Math Standings Engine
function calculateStandings() {
  // Initialize Stats for all teams
  const teamStats = {};
  state.teams.forEach(t => {
    teamStats[t.id] = {
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

  // Helper function to convert Overs Decimal to fractional overs (e.g. 19.2 -> 19 + 2/6 = 19.33)
  function toFractionalOvers(oversDecimal, wickets) {
    if (wickets === 10) {
      return 20.0; // standard T20 rule: if all out, counted as full 20 overs
    }
    const whole = Math.floor(oversDecimal);
    const balls = Math.round((oversDecimal - whole) * 10);
    return whole + (balls / 6);
  }

  // Iterate over matches
  state.matches.forEach(m => {
    const t1 = teamStats[m.team1Id];
    const t2 = teamStats[m.team2Id || m.team2Id_alternative || m.team2Id]; // handle alternate keys
    
    // In case team ID was deleted, skip
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

    // Result outcome
    if (m.runs1 > m.runs2) {
      t1.won++;
      t2.lost++;
      t1.points += 2;
    } else if (m.runs2 > m.runs1) {
      t2.won++;
      t1.lost++;
      t2.points += 2;
    } else {
      // Tie
      t1.points += 1;
      t2.points += 1;
    }
  });

  // Convert to Array & calculate NRR
  const standings = Object.values(teamStats).map(t => {
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
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.won !== a.won) return b.won - a.won;
    if (parseFloat(b.nrr) !== parseFloat(a.nrr)) return parseFloat(b.nrr) - parseFloat(a.nrr);
    return a.name.localeCompare(b.name);
  });

  return standings;
}


// 8. Renders Dashboard Views
function renderDashboard() {
  // Update Top Stats
  document.getElementById("stat-total-teams").innerText = state.teams.length;
  document.getElementById("stat-total-players").innerText = state.players.length;
  document.getElementById("stat-total-matches").innerText = state.matches.length;
  
  // Find top scorer
  if (state.players.length > 0) {
    const topScorer = [...state.players].sort((a, b) => b.runs - a.runs)[0];
    document.getElementById("stat-top-scorer").innerText = `${topScorer.name} (${topScorer.runs})`;
  } else {
    document.getElementById("stat-top-scorer").innerText = "None";
  }

  // Render Standings
  const standings = calculateStandings();
  const tbody = document.getElementById("standings-tbody");
  tbody.innerHTML = "";

  if (standings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No teams registered yet.</td></tr>`;
  } else {
    standings.forEach((team, idx) => {
      const teamObj = state.teams.find(t => t.id === team.id);
      const color = teamObj ? teamObj.color : "#06b6d4";
      const sign = parseFloat(team.nrr) >= 0 ? "+" : "";
      
      tbody.innerHTML += `
        <tr class="standing-row">
          <td><span class="rank-badge">${idx + 1}</span></td>
          <td>
            <div class="team-badge-flex">
              <span class="team-color-dot" style="color: ${color}; background-color: ${color}"></span>
              <span>${team.name}</span>
            </div>
          </td>
          <td style="text-align: center; font-weight: 500;">${team.played}</td>
          <td style="text-align: center; color: var(--accent-emerald);">${team.won}</td>
          <td style="text-align: center; color: var(--accent-rose);">${team.lost}</td>
          <td style="text-align: center; font-weight: 700; color: var(--accent-cyan);">${team.points}</td>
          <td style="text-align: right; font-family: var(--font-display); font-weight: 600;">${sign}${team.nrr}</td>
        </tr>
      `;
    });
  }

  // Render Recent Matches List
  const recentList = document.getElementById("recent-matches-list");
  recentList.innerHTML = "";

  if (state.matches.length === 0) {
    recentList.innerHTML = `<div style="text-align: center; padding: 2rem 0; color: var(--text-muted);">No matches recorded.</div>`;
  } else {
    const recentMatches = [...state.matches].slice(-3).reverse();
    recentMatches.forEach(m => {
      const t1 = state.teams.find(t => t.id === m.team1Id);
      const t2 = state.teams.find(t => t.id === (m.team2Id || m.team2Id_alternative || m.team2Id));
      if (!t1 || !t2) return;

      const isT1Winner = m.runs1 > m.runs2;
      const isT2Winner = m.runs2 > m.runs1;

      recentList.innerHTML += `
        <div class="activity-item">
          <div class="activity-desc">
            <h5>${t1.abbv} vs ${t2.abbv}</h5>
            <p>${m.notes || "Season fixture"}</p>
          </div>
          <div class="activity-score">
            <div style="color: ${isT1Winner ? "var(--accent-emerald)" : "var(--text-secondary)"}">${m.runs1}/${m.wickets1} <span style="font-size: 0.75rem; color: var(--text-muted);">(${m.overs1} ov)</span></div>
            <div style="color: ${isT2Winner ? "var(--accent-emerald)" : "var(--text-secondary)"}">${m.runs2}/${m.wickets2} <span style="font-size: 0.75rem; color: var(--text-muted);">(${m.overs2} ov)</span></div>
          </div>
        </div>
      `;
    });
  }
}

// 9. Renders Player Directory list
function renderPlayersList() {
  const container = document.getElementById("players-grid-container");
  container.innerHTML = "";

  const query = document.getElementById("player-search").value.toLowerCase();
  const filterTeam = document.getElementById("filter-team").value;
  const filterRole = document.getElementById("filter-role").value;

  const filteredPlayers = state.players.filter(p => {
    const matchQuery = p.name.toLowerCase().includes(query);
    const matchTeam = filterTeam === "all" || p.teamId === filterTeam;
    const matchRole = filterRole === "all" || p.role === filterRole;
    return matchQuery && matchTeam && matchRole;
  });

  if (filteredPlayers.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem 0; color: var(--text-muted);">
      <i data-lucide="users" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;"></i>
      <p>No players match the search criteria.</p>
    </div>`;
    lucide.createIcons();
    return;
  }

  filteredPlayers.forEach(p => {
    const team = state.teams.find(t => t.id === p.teamId);
    const teamName = team ? team.name : "Unassigned";
    const teamColor = team ? team.color : "#06b6d4";

    // Setup jersey SVG
    const jerseySVG = getJerseySVG(p.jerseyColor || teamColor, p.jerseyNum);

    container.innerHTML += `
      <div class="player-card" style="--jersey-color: ${p.jerseyColor || teamColor}">
        <div class="player-card-content">
          <div class="player-avatar-container">
            ${jerseySVG}
            <div class="player-card-role-badge" title="${p.role}">
              <i data-lucide="${getRoleIconName(p.role)}"></i>
            </div>
          </div>
          <h3 class="player-card-name">${p.name}</h3>
          <span class="player-card-team" style="color: ${teamColor}; font-weight: 600;">${teamName}</span>
          
          <div class="player-quick-stats">
            <div class="quick-stat-item">
              <span class="quick-stat-val" style="color: var(--accent-cyan);">${p.matches}</span>
              <span class="quick-stat-lbl">Mat</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-val" style="color: var(--accent-emerald);">${p.runs}</span>
              <span class="quick-stat-lbl">Runs</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-val" style="color: var(--accent-amber);">${p.wickets}</span>
              <span class="quick-stat-lbl">Wkts</span>
            </div>
          </div>

          <div class="player-actions">
            <button class="btn btn-secondary" onclick="viewPlayerProfile('${p.id}')">View Profile</button>
            <button class="btn btn-primary" onclick="editPlayer('${p.id}')" style="padding: 0.5rem;"><i data-lucide="edit-3" style="width: 14px; height: 14px;"></i></button>
          </div>
        </div>
      </div>
    `;
  });

  lucide.createIcons();
}

function getRoleIconName(role) {
  switch (role) {
    case "Batsman": return "sword";
    case "Bowler": return "target";
    case "All-Rounder": return "swords";
    case "Wicketkeeper": return "hand";
    default: return "user";
  }
}

// Add real-time filters
document.getElementById("player-search").addEventListener("input", renderPlayersList);
document.getElementById("filter-team").addEventListener("change", renderPlayersList);
document.getElementById("filter-role").addEventListener("change", renderPlayersList);

// 10. Renders Teams List
function renderTeamsList() {
  const container = document.getElementById("teams-grid-container");
  container.innerHTML = "";

  if (state.teams.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem 0; color: var(--text-muted);">No teams registered.</div>`;
    return;
  }

  state.teams.forEach(team => {
    // calculate team size & stats
    const roster = state.players.filter(p => p.teamId === team.id);
    const batsmen = roster.filter(p => p.role === "Batsman" || p.role === "Wicketkeeper").length;
    const bowlers = roster.filter(p => p.role === "Bowler").length;
    const allrounders = roster.filter(p => p.role === "All-Rounder").length;

    // Standings data
    const standings = calculateStandings();
    const standing = standings.find(s => s.id === team.id) || { played: 0, won: 0, lost: 0, points: 0 };

    container.innerHTML += `
      <div class="team-card">
        <div class="team-card-header">
          <span class="team-card-color" style="color: ${team.color}; background-color: ${team.color}"></span>
          <h3 class="team-card-name">${team.abbv ? `${team.name} (${team.abbv})` : team.name}</h3>
        </div>
        
        <div class="team-stats-flex">
          <div class="team-stat-row">
            <span>Roster Size</span>
            <span>${roster.length} Players</span>
          </div>
          <div class="team-stat-row">
            <span>Batsmen / Bowlers / All-Rounders</span>
            <span>${batsmen} / ${bowlers} / ${allrounders}</span>
          </div>
          <div class="team-stat-row" style="margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.5rem;">
            <span>Matches Played</span>
            <span>${standing.played}</span>
          </div>
          <div class="team-stat-row">
            <span>Wins / Losses</span>
            <span style="color: var(--accent-emerald);">${standing.won} <span style="color: var(--text-secondary)">-</span> <span style="color: var(--accent-rose)">${standing.lost}</span></span>
          </div>
          <div class="team-stat-row">
            <span>League Points</span>
            <span style="color: var(--accent-cyan); font-weight: 700;">${standing.points} Pts</span>
          </div>
        </div>

        <button class="btn btn-secondary" onclick="viewTeamRoster('${team.id}')" style="margin-top: auto; width: 100%; justify-content: center;">
          <i data-lucide="eye"></i>
          <span>View Roster</span>
        </button>
      </div>
    `;
  });
  lucide.createIcons();
}

function viewTeamRoster(teamId) {
  const team = state.teams.find(t => t.id === teamId);
  if (!team) return;

  // switch to player view, filter by team
  const playerTab = document.querySelector(".nav-menu .nav-item[data-view='players']");
  if (playerTab) {
    document.getElementById("filter-team").value = teamId;
    document.getElementById("filter-role").value = "all";
    document.getElementById("player-search").value = "";
    playerTab.click();
    showToast(`Showing roster for ${team.name}`, "info");
  }
}

// 11. Match History & Submit
function renderMatchesLog() {
  const tbody = document.getElementById("matches-log-tbody");
  tbody.innerHTML = "";

  if (state.matches.length === 0) {
    tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: var(--text-muted);">No fixtures recorded yet.</td></tr>`;
    return;
  }

  [...state.matches].reverse().forEach(m => {
    const t1 = state.teams.find(t => t.id === m.team1Id);
    const t2 = state.teams.find(t => t.id === (m.team2Id || m.team2Id_alternative || m.team2Id));
    if (!t1 || !t2) return;

    let resultText = "";
    if (m.runs1 > m.runs2) {
      resultText = `<span style="color: var(--accent-emerald); font-weight: 600;">${t1.abbv} won</span> by ${m.runs1 - m.runs2} runs`;
    } else if (m.runs2 > m.runs1) {
      const wicketsLeft = 10 - m.wickets2;
      resultText = `<span style="color: var(--accent-emerald); font-weight: 600;">${t2.abbv} won</span> by ${wicketsLeft} wickets`;
    } else {
      resultText = `<span style="color: var(--accent-amber); font-weight: 600;">Match Tied</span>`;
    }

    tbody.innerHTML += `
      <tr>
        <td>
          <div style="font-weight: 600; font-family: var(--font-display);">${t1.name} <span style="color: var(--text-muted); font-weight: 400; font-size: 0.8rem;">vs</span> ${t2.name}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">
            ${t1.abbv}: ${m.runs1}/${m.wickets1} (${m.overs1} ov) &bull; ${t2.abbv}: ${m.runs2}/${m.wickets2} (${m.overs2} ov)
          </div>
        </td>
        <td style="text-align: right; vertical-align: middle;">
          <div style="font-size: 0.85rem;">${resultText}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted); font-style: italic; margin-top: 0.2rem;">${m.notes || "Season Match"}</div>
        </td>
      </tr>
    `;
  });
}

document.getElementById("match-entry-form").addEventListener("submit", (e) => {
  e.preventDefault();
  
  const team1Id = document.getElementById("match-team-1").value;
  const team2Id = document.getElementById("match-team-2").value;
  const runs1 = parseInt(document.getElementById("match-runs-1").value);
  const wickets1 = parseInt(document.getElementById("match-wickets-1").value);
  const overs1 = parseFloat(document.getElementById("match-overs-1").value);
  const runs2 = parseInt(document.getElementById("match-runs-2").value);
  const wickets2 = parseInt(document.getElementById("match-wickets-2").value);
  const overs2 = parseFloat(document.getElementById("match-overs-2").value);
  const notes = document.getElementById("match-notes").value;

  if (team1Id === team2Id) {
    showToast("A team cannot play against itself!", "error");
    return;
  }

  // Overs decimal validate (e.g. fractional balls cannot exceed .5)
  function isOversValid(ov) {
    const dec = ov - Math.floor(ov);
    return Math.round(dec * 10) <= 5;
  }
  if (!isOversValid(overs1) || !isOversValid(overs2)) {
    showToast("Overs must be valid cricket format (e.g. 19.5 overs, maximum .5 balls)", "error");
    return;
  }

  const newMatch = {
    id: "match-" + Date.now(),
    team1Id,
    team2Id,
    runs1,
    wickets1,
    overs1,
    runs2,
    wickets2,
    overs2,
    notes
  };

  state.matches.push(newMatch);
  saveState();
  
  // Update UI & reset
  document.getElementById("match-entry-form").reset();
  showToast("Match recorded successfully!");
});

document.getElementById("btn-reset-matches").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all match history? Points table will reset.")) {
    state.matches = [];
    saveState();
    showToast("Match history cleared.", "info");
  }
});


// 12. Player Registration submit / editing
document.getElementById("player-registration-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const playerId = document.getElementById("edit-player-id").value;
  const name = document.getElementById("player-name").value;
  const age = parseInt(document.getElementById("player-age").value);
  const teamId = document.getElementById("player-team").value;
  const role = document.getElementById("player-role").value;
  const jerseyNum = parseInt(document.getElementById("player-jersey-num").value);
  const battingStyle = document.getElementById("player-batting-style").value;
  const bowlingStyle = document.getElementById("player-bowling-style").value;

  // Stats
  const matches = parseInt(document.getElementById("player-matches").value) || 0;
  const runs = parseInt(document.getElementById("player-runs").value) || 0;
  const highScore = parseInt(document.getElementById("player-high-score").value) || 0;
  const wickets = parseInt(document.getElementById("player-wickets").value) || 0;
  const bestBowlingRuns = parseInt(document.getElementById("player-best-bowling-runs").value) || 0;
  const bestBowlingWkts = parseInt(document.getElementById("player-best-bowling-wickets").value) || 0;

  // Selected Jersey Color
  const selectedJerseyColor = document.querySelector('input[name="jersey-theme"]:checked').value;

  if (playerId) {
    // Edit mode
    const playerIdx = state.players.findIndex(p => p.id === playerId);
    if (playerIdx > -1) {
      state.players[playerIdx] = {
        ...state.players[playerIdx],
        name, age, teamId, role, jerseyNum, battingStyle, bowlingStyle,
        matches, runs, highScore, wickets, bestBowlingRuns, bestBowlingWkts,
        jerseyColor: selectedJerseyColor
      };
      showToast(`Updated player profile for ${name}`);
    }
  } else {
    // Create mode
    const newPlayer = {
      id: "player-" + Date.now(),
      name, age, teamId, role, jerseyNum, battingStyle, bowlingStyle,
      matches, runs, highScore, wickets, bestBowlingRuns, bestBowlingWkts,
      jerseyColor: selectedJerseyColor
    };
    state.players.push(newPlayer);
    showToast(`Registered player ${name} successfully!`);
  }

  saveState();
  closeModal("modal-player-registration");
});

function editPlayer(id) {
  const player = state.players.find(p => p.id === id);
  if (!player) return;

  // Fill in form values
  document.getElementById("edit-player-id").value = player.id;
  document.getElementById("player-name").value = player.name;
  document.getElementById("player-age").value = player.age;
  
  populateTeamDropdowns();
  document.getElementById("player-team").value = player.teamId;
  document.getElementById("player-role").value = player.role;
  document.getElementById("player-jersey-num").value = player.jerseyNum;
  document.getElementById("player-batting-style").value = player.battingStyle;
  document.getElementById("player-bowling-style").value = player.bowlingStyle;

  document.getElementById("player-matches").value = player.matches;
  document.getElementById("player-runs").value = player.runs;
  document.getElementById("player-high-score").value = player.highScore;
  document.getElementById("player-wickets").value = player.wickets;
  document.getElementById("player-best-bowling-runs").value = player.bestBowlingRuns;
  document.getElementById("player-best-bowling-wickets").value = player.bestBowlingWkts;

  // Check the corresponding jersey color radio button
  const jerseyRadio = document.querySelector(`input[name="jersey-theme"][value="${player.jerseyColor || '#3b82f6'}"]`);
  if (jerseyRadio) jerseyRadio.checked = true;

  document.getElementById("player-modal-title-text").innerHTML = `<i data-lucide="edit" style="color: var(--accent-cyan)"></i> Edit Player Profile`;
  
  closeModal("modal-player-detail"); // in case detailed profile was open
  openModal("modal-player-registration");
  lucide.createIcons();
}


// 13. Team Creation Submit
document.getElementById("team-creation-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("team-name").value;
  const abbv = document.getElementById("team-abbv").value.toUpperCase();
  const color = document.getElementById("team-color").value;

  // validate uniqueness
  if (state.teams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
    showToast("A team with this name already exists!", "error");
    return;
  }
  if (state.teams.some(t => t.abbv === abbv)) {
    showToast("This abbreviation is already taken!", "error");
    return;
  }

  const newTeam = {
    id: "team-" + Date.now(),
    name,
    abbv,
    color
  };

  state.teams.push(newTeam);
  saveState();
  
  closeModal("modal-team-creation");
  showToast(`Team ${name} created!`);
});


// 14. Player Detail Modal View
function viewPlayerProfile(id) {
  const player = state.players.find(p => p.id === id);
  if (!player) return;

  const team = state.teams.find(t => t.id === player.teamId);
  const teamName = team ? team.name : "Unassigned";
  const teamColor = team ? team.color : "#06b6d4";

  // SVG jersey
  document.getElementById("detail-jersey-placeholder").innerHTML = getJerseySVG(player.jerseyColor || teamColor, player.jerseyNum);
  
  // Set fields
  document.getElementById("detail-name").innerText = player.name;
  document.getElementById("detail-team-role").innerHTML = `${player.role} &bull; <span style="color: ${teamColor}; font-weight:600;">${teamName}</span>`;
  
  // Badges
  const badges = document.getElementById("detail-badges-container");
  badges.innerHTML = `
    <span class="badge badge-cyan">${player.battingStyle}</span>
    <span class="badge badge-violet">${player.bowlingStyle !== 'None' ? player.bowlingStyle : 'Non-Bowler'}</span>
    <span class="badge badge-amber">Age: ${player.age}</span>
  `;

  // Career Stats Math
  document.getElementById("detail-matches").innerText = player.matches;
  document.getElementById("detail-runs").innerText = player.runs;
  document.getElementById("detail-high-score").innerText = player.highScore;
  document.getElementById("detail-wickets").innerText = player.wickets;
  document.getElementById("detail-best-bowling").innerText = `${player.bestBowlingWkts}/${player.bestBowlingRuns}`;

  const batAvg = player.matches > 0 ? (player.runs / player.matches).toFixed(2) : "0.00";
  document.getElementById("detail-batting-avg").innerText = batAvg;

  // Calculate dynamic prowess ratings
  const batProwess = player.matches > 0 
    ? Math.min(100, Math.round(((player.runs / player.matches) * 1.5) + (player.highScore / 2.5))) 
    : 0;

  const bowlProwess = player.matches > 0 
    ? Math.min(100, Math.round(((player.wickets / player.matches) * 40) + (player.wickets * 0.2))) 
    : 0;

  // Set bars
  document.getElementById("detail-batting-rating-num").innerText = `${batProwess}%`;
  document.getElementById("detail-bowling-rating-num").innerText = `${bowlProwess}%`;

  // Reset widths first to trigger CSS animation on view
  const batBar = document.getElementById("detail-batting-rating-bar");
  const bowlBar = document.getElementById("detail-bowling-rating-bar");
  batBar.style.width = "0%";
  bowlBar.style.width = "0%";

  openModal("modal-player-detail");

  // Animate width
  setTimeout(() => {
    batBar.style.width = `${batProwess}%`;
    bowlBar.style.width = `${bowlProwess}%`;
  }, 100);

  // Setup buttons in Modal
  document.getElementById("btn-detail-edit").onclick = () => editPlayer(player.id);
  document.getElementById("btn-detail-delete").onclick = () => deletePlayer(player.id);
}

function deletePlayer(id) {
  const player = state.players.find(p => p.id === id);
  if (!player) return;

  if (confirm(`Are you sure you want to remove ${player.name} from the league database?`)) {
    state.players = state.players.filter(p => p.id !== id);
    saveState();
    closeModal("modal-player-detail");
    showToast(`Removed player ${player.name} from directory.`, "info");
  }
}

// 15. Render All Initial Elements on startup
function renderApp() {
  populateTeamDropdowns();
  renderDashboard();
  renderMatchesLog();
  
  // update sidebar header name dynamically if players want
  const activeView = document.querySelector(".nav-menu .nav-item.active").getAttribute("data-view");
  if (activeView === "players") renderPlayersList();
  if (activeView === "teams") renderTeamsList();
}

// Kickstart
document.addEventListener("DOMContentLoaded", async () => {
  // If sync key exists, pull first
  const syncKey = localStorage.getItem("clm_sync_key");
  if (syncKey) {
    updateSyncIndicator("syncing");
    const success = await syncPullState();
    if (success) {
      showToast("Synchronized data loaded from cloud.");
    } else {
      showToast("Offline mode: loaded cached local data.", "info");
    }
  }
  
  renderApp();
  
  // Setup sync settings view event listeners
  setupSyncEventListeners();
  renderSyncSettings();
});

// Expose functions globally for dynamic inline HTML onclick events
window.viewPlayerProfile = viewPlayerProfile;
window.editPlayer = editPlayer;
window.viewTeamRoster = viewTeamRoster;
