const LEADERBOARD_KEY = 'allFighter_leaderboard';
const MAX_LEADERBOARD = 10;

function getLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addLeaderboardEntry(initials, score) {
  const entries = getLeaderboard();
  entries.push({ initials: initials.toUpperCase(), score: score || 0 });
  entries.sort((a, b) => b.score - a.score);
  const top = entries.slice(0, MAX_LEADERBOARD);
  try { localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(top)); } catch {}
  return top;
}
