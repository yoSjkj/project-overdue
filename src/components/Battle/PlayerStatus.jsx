export default function PlayerStatus({ hp, maxHp, block, ink, maxInk }) {
  const hpPct = Math.max(0, hp / maxHp)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      padding: '8px 16px',
      background: 'rgba(0,0,0,0.3)',
      borderTop: '1px solid #222',
      borderBottom: '1px solid #222',
    }}>
      {/* HP 바 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: '#E57373', width: 20 }}>❤</span>
        <div style={{
          flex: 1,
          height: 10,
          background: '#2a0a0a',
          border: '1px solid #5a1a1a',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${hpPct * 100}%`,
            height: '100%',
            background: hpPct > 0.5 ? '#4CAF50' : hpPct > 0.25 ? '#FF9800' : '#F44336',
            transition: 'width 0.3s ease',
          }} />
        </div>
        <span style={{ fontSize: 11, color: '#AAA', minWidth: 48, textAlign: 'right' }}>
          {hp} / {maxHp}
        </span>
      </div>

      {/* 방어도 + 잉크 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* 방어도 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#4FC3F7' }}>🛡</span>
          <span style={{ fontSize: 12, color: block > 0 ? '#4FC3F7' : '#555' }}>
            {block}
          </span>
        </div>

        {/* 잉크 (마나) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: '#888' }}>잉크</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: maxInk }).map((_, i) => (
              <div key={i} style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: i < ink ? '#7B1FA2' : '#1a1a1a',
                border: `1px solid ${i < ink ? '#CE93D8' : '#333'}`,
                transition: 'background 0.2s',
              }} />
            ))}
          </div>
          <span style={{ fontSize: 10, color: '#AAA' }}>{ink}/{maxInk}</span>
        </div>
      </div>
    </div>
  )
}
