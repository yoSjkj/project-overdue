const TYPE_STYLE = {
  attack: { bg: '#4A1010', border: '#C0392B', label: '공격', labelColor: '#FF8080' },
  defense: { bg: '#0D1F3C', border: '#2980B9', label: '방어', labelColor: '#80B8FF' },
  skill: { bg: '#2A1F00', border: '#C49A00', label: '스킬', labelColor: '#FFD700' },
}

export default function Card({ card, onClick, disabled, selected, pulsed }) {
  const style = TYPE_STYLE[card.type] || TYPE_STYLE.skill

  return (
    <button
      onClick={() => !disabled && onClick?.(card)}
      style={{
        width: 60,
        minHeight: 88,
        background: selected ? '#3A3A0A' : style.bg,
        border: `2px solid ${selected ? '#FFD700' : pulsed ? '#FFFFFF' : style.border}`,
        borderRadius: 4,
        padding: '4px 3px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        flexShrink: 0,
        transition: 'transform 0.1s',
        transform: selected ? 'translateY(-8px)' : pulsed ? 'translateY(-4px)' : 'none',
        touchAction: 'manipulation',
        animation: pulsed ? 'card-pulse 1s ease-in-out infinite alternate' : 'none',
      }}
    >
      <style>{`
        @keyframes card-pulse {
          from { box-shadow: 0 0 6px 2px rgba(255,255,255,0.3); }
          to   { box-shadow: 0 0 14px 4px rgba(255,255,255,0.7); }
        }
      `}</style>
      {/* 비용 */}
      <div style={{
        alignSelf: 'flex-start',
        width: 18,
        height: 18,
        background: '#1a2a4a',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 'bold',
        color: '#80CFFF',
        border: '1px solid #2980B9',
      }}>
        {card.cost}
      </div>

      {/* 타입 라벨 */}
      <div style={{ fontSize: 9, color: style.labelColor, letterSpacing: 1 }}>
        {style.label}
      </div>

      {/* 카드명 */}
      <div style={{
        fontSize: 9,
        color: '#E8E8E8',
        textAlign: 'center',
        lineHeight: 1.3,
        wordBreak: 'keep-all',
        fontWeight: 'bold',
      }}>
        {card.name}
      </div>

      {/* 효과 요약 */}
      <div style={{
        fontSize: 8,
        color: '#999',
        textAlign: 'center',
        lineHeight: 1.3,
        marginTop: 'auto',
      }}>
        {card.description}
      </div>
    </button>
  )
}
