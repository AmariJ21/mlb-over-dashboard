'use client'

import { useEffect, useState } from 'react'

// ─── helpers ────────────────────────────────────────────────────────────────

function signalLabel(edge) {
  if (edge >= 0.12) return { text: '🔥 Strong over signal', color: '#3B6D11', bg: '#EAF3DE' }
  if (edge >= 0.06) return { text: '📈 Mild over signal',   color: '#854F0B', bg: '#FAEEDA' }
  if (edge >= 0.01) return { text: '➡️ Slight lean over',   color: '#5F5E5A', bg: '#F1EFE8' }
  if (edge >= -0.05) return { text: '⚖️ Roughly fair',      color: '#5F5E5A', bg: '#F1EFE8' }
  return                      { text: '📉 Under signal',     color: '#A32D2D', bg: '#FCEBEB' }
}

function pct(n) {
  return (n * 100).toFixed(1) + '%'
}

function barWidth(edge) {
  return Math.min(100, Math.max(4, Math.abs(edge) * 500))
}

function barColor(edge) {
  if (edge >= 0.12) return '#639922'
  if (edge >= 0.06) return '#BA7517'
  if (edge >= 0) return '#888780'
  return '#A32D2D'
}

// ─── game card ──────────────────────────────────────────────────────────────

function GameCard({ game, rank }) {
  const signal = signalLabel(game.edge)
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        background: '#1a1d27',
        border: rank === 1 ? '1px solid #639922' : '1px solid #2a2d3a',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setOpen(o => !o)}
      >
        {/* Left: rank + matchup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: rank === 1 ? '#639922' : '#2a2d3a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: rank === 1 ? '#fff' : '#888',
              flexShrink: 0,
            }}
          >
            {rank}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#e8e8e8' }}>
              {game.away} <span style={{ color: '#555', fontWeight: 400 }}>@</span> {game.home}
            </div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              {game.gameTime} · {game.venue}
            </div>
          </div>
        </div>

        {/* Right: signal badge + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              background: signal.bg,
              color: signal.color,
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 6,
            }}
          >
            {signal.text}
          </span>
          <span style={{ color: '#555', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Signal bar */}
      <div style={{ height: 3, background: '#12141c' }}>
        <div
          style={{
            width: barWidth(game.edge) + '%',
            height: '100%',
            background: barColor(game.edge),
            borderRadius: '0 2px 2px 0',
          }}
        />
      </div>

      {/* Summary row — always visible */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          background: '#12141c',
        }}
      >
        {[
          { label: 'Run line', value: game.line.toFixed(1), sub: 'over/under' },
          { label: 'Avg runs last 5 games', value: game.combinedL5.toFixed(1), sub: 'both teams combined' },
          { label: 'Model says over', value: pct(game.modelProb), sub: 'based on recent scoring' },
          { label: 'Market says over', value: pct(game.marketProb), sub: 'Kalshi — coming soon' },
        ].map((cell, i) => (
          <div
            key={i}
            style={{
              background: '#1a1d27',
              padding: '12px 18px',
              borderTop: '1px solid #12141c',
            }}
          >
            <div style={{ fontSize: 11, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {cell.label}
            </div>
            <div
              className="mono"
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: i === 2 && game.modelProb > 0.5 ? '#639922' : '#e8e8e8',
              }}
            >
              {cell.value}
            </div>
            <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{cell.sub}</div>
          </div>
        ))}
      </div>

      {/* Expandable detail */}
      {open && (
        <div style={{ padding: '16px 18px', borderTop: '1px solid #12141c' }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            How we got here
          </div>

          {/* Team breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { name: game.away, l5: game.awayAvgL5, l10: game.awayAvgL10, label: 'Away' },
              { name: game.home, l5: game.homeAvgL5, l10: game.homeAvgL10, label: 'Home' },
            ].map(team => (
              <div
                key={team.name}
                style={{ background: '#12141c', borderRadius: 8, padding: '12px 14px' }}
              >
                <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{team.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#ccc', marginBottom: 8 }}>{team.name}</div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <div className="mono" style={{ fontSize: 18, color: '#e8e8e8', fontWeight: 600 }}>{team.l5.toFixed(1)}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>avg runs, last 5</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 18, color: '#888', fontWeight: 500 }}>{team.l10.toFixed(1)}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>avg runs, last 10</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Plain English explanation */}
          <div
            style={{
              background: '#12141c',
              borderRadius: 8,
              padding: '12px 14px',
              fontSize: 13,
              color: '#888',
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: '#ccc' }}>What does this mean?</strong>
            <br />
            Combined, these two teams have been averaging{' '}
            <strong style={{ color: '#e8e8e8' }}>{game.combinedL5.toFixed(1)} runs per game</strong> over their last 5 games.
            The line is set at <strong style={{ color: '#e8e8e8' }}>{game.line}</strong> runs.
            Our model estimates there is a{' '}
            <strong style={{ color: game.modelProb > 0.5 ? '#639922' : '#A32D2D' }}>
              {pct(game.modelProb)} chance
            </strong>{' '}
            this game goes over {game.line} runs.
            {game.edge > 0.05 && (
              <span>
                {' '}That is meaningfully higher than what the market is currently pricing, which is why this game shows up near the top.
              </span>
            )}
            {game.edge <= 0 && (
              <span>
                {' '}The market appears fairly priced or slightly better than our model estimate for this game.
              </span>
            )}
          </div>

          <div style={{ marginTop: 10, fontSize: 11, color: '#444' }}>
            Model uses a Poisson distribution blending L5 (60% weight) and L10 (40% weight) run averages.
            Market probability is a placeholder (50%) until Kalshi integration is live.
          </div>
        </div>
      )}
    </div>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/games')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setData(d)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const games = data?.games || []

  const filtered = games.filter(g => {
    if (filter === 'over') return g.edge > 0
    if (filter === 'strong') return g.edge >= 0.06
    return true
  })

  const topEdge = games.length ? Math.max(...games.map(g => g.edge)) : null
  const overCount = games.filter(g => g.edge > 0).length

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#e8e8e8' }}>
            ⚾ MLB Over 5.5 Runs
          </span>
          <span
            style={{
              background: '#1a2e12',
              color: '#639922',
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 20,
              border: '1px solid #2d4d1a',
            }}
          >
            LIVE
          </span>
        </div>
        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, maxWidth: 560 }}>
          We look at how many runs each team has scored in their last 5 and 10 games,
          then estimate the probability of a combined score over 5.5. Games are ranked
          from highest to lowest opportunity.
        </p>
        {data && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#444' }}>
            Last updated {new Date(data.fetchedAt).toLocaleTimeString()} ·
            Data from MLB Stats API (free, official)
          </div>
        )}
      </div>

      {/* Metric cards */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
          {[
            {
              label: 'Games today',
              value: games.length,
              sub: 'not yet final',
            },
            {
              label: 'Over signals',
              value: overCount,
              sub: 'model edge above market',
              highlight: overCount > 0,
            },
            {
              label: 'Top opportunity',
              value: topEdge !== null ? (topEdge > 0 ? '+' : '') + (topEdge * 100).toFixed(1) + '%' : '—',
              sub: 'model vs market edge',
              highlight: topEdge > 0.05,
            },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                background: '#1a1d27',
                border: '1px solid #2a2d3a',
                borderRadius: 10,
                padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                {m.label}
              </div>
              <div
                className="mono"
                style={{ fontSize: 26, fontWeight: 700, color: m.highlight ? '#639922' : '#e8e8e8' }}
              >
                {m.value}
              </div>
              <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter buttons */}
      {!loading && !error && games.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All games' },
            { key: 'over', label: 'Over signals only' },
            { key: 'strong', label: '🔥 Strong signals only' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                border: filter === f.key ? '1px solid #639922' : '1px solid #2a2d3a',
                background: filter === f.key ? '#1a2e12' : '#1a1d27',
                color: filter === f.key ? '#639922' : '#666',
                fontSize: 13,
                fontWeight: filter === f.key ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 15 }}>Loading today's games…</div>
          <div style={{ fontSize: 13, marginTop: 6, color: '#444' }}>Fetching MLB data and calculating signals</div>
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#2a1212',
            border: '1px solid #4a2020',
            borderRadius: 10,
            padding: '20px 24px',
            color: '#cc6666',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Could not load games</div>
          <div style={{ fontSize: 13 }}>{error}</div>
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🌙</div>
          <div style={{ fontSize: 15 }}>No games scheduled today</div>
          <div style={{ fontSize: 13, marginTop: 6, color: '#444' }}>Check back tomorrow</div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && games.length > 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#555' }}>
          <div style={{ fontSize: 14 }}>No games match this filter</div>
          <button
            onClick={() => setFilter('all')}
            style={{ marginTop: 10, color: '#639922', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
          >
            Show all games
          </button>
        </div>
      )}

      {/* Game cards */}
      {filtered.map((game, i) => (
        <GameCard key={game.gameId} game={game} rank={i + 1} />
      ))}

      {/* How it works */}
      {!loading && !error && games.length > 0 && (
        <div
          style={{
            marginTop: 32,
            background: '#1a1d27',
            border: '1px solid #2a2d3a',
            borderRadius: 12,
            padding: '20px 24px',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            How it works
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              {
                step: '1',
                title: 'We pull recent scoring',
                body: 'For every team playing today, we look at how many runs they scored in their last 5 and 10 games.',
              },
              {
                step: '2',
                title: 'We estimate the probability',
                body: 'Using a Poisson model, we calculate the chance that both teams combined score more than 5.5 runs.',
              },
              {
                step: '3',
                title: 'We compare to the market',
                body: 'We rank games where our model is most bullish on the over. Kalshi odds will be added soon for real edge calculation.',
              },
            ].map(s => (
              <div key={s.step}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#2a2d3a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#639922',
                    marginBottom: 8,
                  }}
                >
                  {s.step}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 24, fontSize: 11, color: '#333', textAlign: 'center', lineHeight: 1.8 }}>
        Data from MLB Stats API (free, official) · Not financial advice · Kalshi integration coming in v2
      </div>
    </main>
  )
}
