const INTENT_LABEL = {
  attack: (v, strong) => ({ icon: strong ? '⚔⚔' : '⚔', text: `${v} 데미지`, color: '#FF5252' }),
  defend: (v) => ({ icon: '🛡', text: `+${v} 방어`, color: '#4FC3F7' }),
  debuff: () => ({ icon: '💀', text: '디버프', color: '#CE93D8' }),
  stunned: () => ({ icon: '💫', text: '행동 불가', color: '#888' }),
  unknown: () => ({ icon: '?', text: '...', color: '#888' }),
}

export default function EnemyDisplay({ enemy, intent }) {
  if (!enemy) return null

  const hpPct = Math.max(0, enemy.currentHp / (enemy.maxHp || enemy.hp))
  const intentInfo = intent
    ? (INTENT_LABEL[intent.type]?.(intent.value, intent.strong) ?? INTENT_LABEL.unknown())
    : null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      padding: '16px 0 8px',
    }}>
      {/* 인텐트 */}
      {intentInfo && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(0,0,0,0.4)',
          border: `1px solid ${intentInfo.color}44`,
          borderRadius: 4,
          padding: '3px 10px',
          fontSize: 12,
          color: intentInfo.color,
        }}>
          <span style={{ fontSize: 14 }}>{intentInfo.icon}</span>
          <span>{intentInfo.text}</span>
        </div>
      )}

      {/* 적 스프라이트 자리 (플레이스홀더) */}
      <div style={{
        width: 96,
        height: 96,
        background: enemy.color || '#4A4A4A',
        border: '2px solid #666',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        color: '#999',
        position: 'relative',
      }}>
        {/* DoT 표시 */}
        {enemy.dot > 0 && (
          <div style={{
            position: 'absolute',
            top: -8,
            right: -8,
            background: '#FF6D00',
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            color: '#fff',
            fontWeight: 'bold',
          }}>
            {enemy.dot}
          </div>
        )}
        {/* 스턴 표시 */}
        {enemy.stunned > 0 && (
          <div style={{
            position: 'absolute',
            top: -8,
            left: -8,
            background: '#7B1FA2',
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
          }}>
            💫
          </div>
        )}
        <span style={{ fontSize: 10, color: '#ccc' }}>sprite</span>
      </div>

      {/* 적 이름 */}
      <div style={{ fontSize: 13, color: '#DDD', fontWeight: 'bold' }}>
        {enemy.name}
      </div>

      {/* HP 바 */}
      <div style={{ width: 160 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          color: '#AAA',
          marginBottom: 3,
        }}>
          <span>HP</span>
          <span>{enemy.currentHp} / {enemy.maxHp || enemy.hp}</span>
        </div>
        <div style={{
          width: '100%',
          height: 8,
          background: '#2a0a0a',
          borderRadius: 2,
          border: '1px solid #5a1a1a',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${hpPct * 100}%`,
            height: '100%',
            background: hpPct > 0.5 ? '#E53935' : hpPct > 0.25 ? '#FF6D00' : '#FF1744',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* 적 방어도 */}
      {(enemy.block || 0) > 0 && (
        <div style={{ fontSize: 11, color: '#4FC3F7' }}>
          🛡 {enemy.block}
        </div>
      )}
    </div>
  )
}
