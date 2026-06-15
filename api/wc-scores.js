// ============================================================
// api/wc-scores.js — Vercel Serverless Function
// Secure proxy untuk FIFA World Cup 2026 score API
//
// ✅ API key TIDAK pernah dikirim ke browser
// ✅ Disimpan sebagai Vercel Environment Variable
// ✅ In-memory cache untuk hemat request API
// ✅ Support 3 provider: football-data.org, wc2026api, apifootball
// ============================================================

// ── IN-MEMORY CACHE ──────────────────────────────────────
// Cache direset tiap cold start (per function instance)
const cache = new Map();
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300') * 1000; // ms

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
  console.log(`[CACHE HIT] ${key} (age: ${Math.floor((Date.now()-entry.ts)/1000)}s)`);
  return entry.data;
}
function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// ── API FETCHERS ─────────────────────────────────────────
async function fetchFootballData(endpoint) {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) throw new Error('FOOTBALL_DATA_API_KEY belum dikonfigurasi di Environment Variables');
  const url = `https://api.football-data.org/v4/${endpoint}`;
  const res = await fetch(url, {
    headers: { 'X-Auth-Token': key },
    signal: AbortSignal.timeout(12000)
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`football-data.org error: HTTP ${res.status} — ${body.slice(0,150)}`);
  }
  return res.json();
}

async function fetchWC2026API(endpoint) {
  const key = process.env.WC2026_API_KEY;
  if (!key) throw new Error('WC2026_API_KEY belum dikonfigurasi di Environment Variables');
  const url = `https://api.wc2026api.com/${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${key}` },
    signal: AbortSignal.timeout(12000)
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`wc2026api.com error: HTTP ${res.status} — ${body.slice(0,150)}`);
  }
  return res.json();
}

async function fetchApiFootball(endpoint) {
  const key = process.env.APIFOOTBALL_API_KEY;
  if (!key) throw new Error('APIFOOTBALL_API_KEY belum dikonfigurasi di Environment Variables');
  const url = `https://v3.football.api-sports.io/${endpoint}`;
  const res = await fetch(url, {
    headers: { 'x-apisports-key': key },
    signal: AbortSignal.timeout(12000)
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API-Football error: HTTP ${res.status} — ${body.slice(0,150)}`);
  }
  return res.json();
}

// ── DATA NORMALIZER ───────────────────────────────────────
// Semua provider dinormalisasi ke format seragam:
// {
//   matches: [{
//     matchNum, homeTeam, awayTeam,
//     homeScore, awayScore,
//     stage, group, status, kickoffUTC
//   }],
//   source, fetchedAt
// }

function normalizeFootballData(raw) {
  const matches = (raw.matches || []).map(m => {
    const ft = m.score?.fullTime || m.score?.regularTime || {};
    return {
      matchNum:   m.matchday ?? null,
      homeTeam:   m.homeTeam?.shortName || m.homeTeam?.name || '',
      awayTeam:   m.awayTeam?.shortName || m.awayTeam?.name || '',
      homeScore:  ft.home  ?? null,
      awayScore:  ft.away  ?? null,
      stage:      (m.stage || '').toLowerCase(),
      group:      (m.group || '').replace(/GROUP_/i,''),
      status:     m.status || '',
      kickoffUTC: m.utcDate || ''
    };
  });
  return { matches, source: 'football-data.org', fetchedAt: new Date().toISOString() };
}

function normalizeWC2026API(raw) {
  const arr = Array.isArray(raw) ? raw : (raw.data || raw.matches || []);
  const matches = arr.map(m => ({
    matchNum:   parseInt(m.match_number || m.id || 0),
    homeTeam:   m.home_team  || '',
    awayTeam:   m.away_team  || '',
    homeScore:  m.home_score ?? null,
    awayScore:  m.away_score ?? null,
    stage:      (m.round || '').toLowerCase(),
    group:      (m.group_name || '').replace(/group\s*/i,'').trim().toUpperCase(),
    status:     m.status || '',
    kickoffUTC: m.kickoff_utc || ''
  }));
  return { matches, source: 'wc2026api.com', fetchedAt: new Date().toISOString() };
}

function normalizeApiFootball(raw) {
  const arr = raw.response || [];
  const matches = arr.map(f => ({
    matchNum:   f.fixture?.id ?? null,
    homeTeam:   f.teams?.home?.name || '',
    awayTeam:   f.teams?.away?.name || '',
    homeScore:  f.goals?.home  ?? null,
    awayScore:  f.goals?.away  ?? null,
    stage:      (f.league?.round || '').toLowerCase(),
    group:      '',
    status:     f.fixture?.status?.short || '',
    kickoffUTC: f.fixture?.date || ''
  }));
  return { matches, source: 'api-football (RapidAPI)', fetchedAt: new Date().toISOString() };
}

// ── MAIN VERCEL HANDLER ───────────────────────────────────
export default async function handler(req, res) {
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const provider = process.env.API_PROVIDER || 'football-data';
  const cacheKey = `wc_scores_${provider}`;

  // Check cache
  const cached = getCached(cacheKey);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('X-Provider', provider);
    res.setHeader('Cache-Control', `public, s-maxage=${Math.floor(CACHE_TTL/1000)}, stale-while-revalidate=60`);
    return res.status(200).json(cached);
  }

  // Fetch fresh data
  console.log(`[FETCH] Provider: ${provider}`);
  try {
    let raw, normalized;

    if (provider === 'football-data') {
      raw = await fetchFootballData('competitions/WC/matches?season=2026');
      normalized = normalizeFootballData(raw);
    } else if (provider === 'wc2026api') {
      raw = await fetchWC2026API('matches');
      normalized = normalizeWC2026API(raw);
    } else if (provider === 'apifootball') {
      raw = await fetchApiFootball('fixtures?league=1&season=2026');
      normalized = normalizeApiFootball(raw);
    } else {
      return res.status(400).json({ error: `Unknown provider: ${provider}` });
    }

    setCache(cacheKey, normalized);
    console.log(`[OK] ${normalized.matches.length} matches from ${provider}`);

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Provider', provider);
    res.setHeader('Cache-Control', `public, s-maxage=${Math.floor(CACHE_TTL/1000)}, stale-while-revalidate=60`);
    return res.status(200).json(normalized);

  } catch (err) {
    console.error(`[ERROR] ${err.message}`);
    return res.status(502).json({
      error: err.message,
      provider,
      hint: 'Cek Environment Variables di Vercel Project Settings → Environment Variables',
      docs: 'https://vercel.com/docs/environment-variables'
    });
  }
}
