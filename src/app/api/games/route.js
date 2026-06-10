// src/app/api/games/route.js
// Fetches today's MLB games + team run averages from the free MLB Stats API.
// No API key required. Runs server-side on Vercel.

const MLB_BASE = 'https://statsapi.mlb.com/api/v1'
const LINE = 5.5
const CACHE_SECONDS = 300

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://www.mlb.com',
  'Referer': 'https://www.mlb.com/',
}

function poissonCDF(lambda, k) {
  let sum = 0
  let term = Math.exp(-lambda)
  for (let i = 0; i <= k; i++) {
    sum += term
    if (i < k) term *= lambda / (i + 1)
  }
  return sum
}

function probOver(lambda) {
  return 1 - poissonCDF(lambda, Math.floor(LINE))
}

async function fetchTeamRunAvgs(teamId, season) {
  try {
    const url = `${MLB_BASE}/teams/${teamId}/stats?stats=gameLog&group=hitting&season=${season}&limit=10`
    const res = await fetch(url, {
      headers: HEADERS,
      next: { revalidate: CACHE_SECONDS },
    })
    if (!res.ok) return { avgL5: 4.5, avgL10: 4.5, gamesUsed: 0 }
    const data = await res.json()
    const logs = (data.stats?.[0]?.splits || [])
      .slice(-10)
      .map(s => parseFloat(s.stat?.runs) || 0)
    const l5 = logs.slice(-5)
    const l10 = logs
    return {
      avgL5: l5.length ? l5.reduce((a, b) => a + b, 0) / l5.length : 4.5,
      avgL10: l10.length ? l10.reduce((a, b) => a + b, 0) / l10.length : 4.5,
      gamesUsed: l10.length,
    }
  } catch {
    return { avgL5: 4.5, avgL10: 4.5, gamesUsed: 0 }
  }
}

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const season = new Date().getFullYear()

    const schedRes = await fetch(
      `${MLB_BASE}/schedule?sportId=1&date=${today}&hydrate=team,venue,linescore`,
      {
        headers: HEADERS,
        next: { revalidate: CACHE_SECONDS },
      }
    )

    if (!schedRes.ok) {
      return Response.json(
        { error: `MLB API returned ${schedRes.status}`, games: [] },
        { status: 502 }
      )
    }

    const schedData = await schedRes.json()
    const games = schedData.dates?.[0]?.games || []
    const upcoming = games.filter(g => g.status?.abstractGameState !== 'Final')

    const results = await Promise.all(
      upcoming.map(async g => {
        const awayId = g.teams?.away?.team?.id
        const homeId = g.teams?.home?.team?.id
        const awayName = g.teams?.away?.team?.name || 'Away'
        const homeName = g.teams?.home?.team?.name || 'Home'

        const [awayStats, homeStats] = await Promise.all([
          fetchTeamRunAvgs(awayId, season),
          fetchTeamRunAvgs(homeId, season),
        ])

        const combinedL5 = awayStats.avgL5 + homeStats.avgL5
        const combinedL10 = awayStats.avgL10 + homeStats.avgL10
        const lambda = combinedL5 * 0.6 + combinedL10 * 0.4
        const modelProb = probOver(lambda)
        const marketProb = 0.5
        const edge = modelProb - marketProb

        const gameTime = g.gameDate
          ? new Date(g.gameDate).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              timeZone: 'America/New_York',
              timeZoneName: 'short',
            })
          : 'TBD'

        return {
          gameId: g.gamePk,
          away: awayName,
          home: homeName,
          venue: g.venue?.name || '—',
          gameTime,
          status: g.status?.detailedState || 'Scheduled',
          awayAvgL5: parseFloat(awayStats.avgL5.toFixed(2)),
          awayAvgL10: parseFloat(awayStats.avgL10.toFixed(2)),
          homeAvgL5: parseFloat(homeStats.avgL5.toFixed(2)),
          homeAvgL10: parseFloat(homeStats.avgL10.toFixed(2)),
          combinedL5: parseFloat(combinedL5.toFixed(2)),
          combinedL10: parseFloat(combinedL10.toFixed(2)),
          lambda: parseFloat(lambda.toFixed(2)),
          modelProb: parseFloat(modelProb.toFixed(4)),
          marketProb,
          edge: parseFloat(edge.toFixed(4)),
          line: LINE,
        }
      })
    )

    results.sort((a, b) => b.edge - a.edge)

    return Response.json(
      {
        date: today,
        fetchedAt: new Date().toISOString(),
        gamesCount: results.length,
        games: results,
      },
      {
        headers: {
          'Cache-Control': `s-maxage=${CACHE_SECONDS}, stale-while-revalidate`,
        },
      }
    )
  } catch (err) {
    return Response.json(
      { error: 'Failed to fetch MLB data', detail: err.message, games: [] },
      { status: 500 }
    )
  }
}
