import { useState } from 'react'
import cardsData from '../../data/cards.json'
import { useGameStore } from '../../stores/gameStore'
import { useDeckStore } from '../../stores/deckStore'

const TYPE_STYLE = {
  attack:  { bg: '#4A1010', border: '#C0392B', label: '공격', labelColor: '#FF8080' },
  defense: { bg: '#0D1F3C', border: '#2980B9', label: '방어', labelColor: '#80B8FF' },
  skill:   { bg: '#2A1F00', border: '#C49A00', label: '스킬', labelColor: '#FFD700' },
}

// 2번째 전투 적
const SECOND_ENEMY = {
  id: 'overdue_phantom',
  name: '연체 유령',
  hp: 28, maxHp: 28,
  pattern: ['attack', 'attack', 'defend'],
  attack: 5,
  color: '#1a0a3e',
}

export default function RewardScreen() {
  const pendingRewardPool = useGameStore(s => s.pendingRewardPool)
  const addCardToDeck = useDeckStore(s => s.addCardToDeck)
  const [selected, setSelected] = useState(null)

  const cards = (pendingRewardPool ?? [])
    .map(id => cardsData.find(c => c.id === id))
    .filter(Boolean)

  const handleNext = (pickedId) => {
    if (pickedId) addCardToDeck(pickedId)
    useGameStore.setState({ pendingEnemy: SECOND_ENEMY, scene: 'battle' })
  }

  return (
    <div style={{
      position: 'relative',
      height: '100%',
      background: 'linear-gradient(180deg, #0d0618 0%, #1a0a2e 60%, #0a0520 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 16px 24px',
      gap: 0,
    }}>

      {/* 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: '#9B7EC8', letterSpacing: 3, marginBottom: 4 }}>
          안내서
        </div>
        <div style={{ fontSize: 16, color: '#E8D5FF', letterSpacing: 1 }}>
          페이지 획득
        </div>
        <div style={{ fontSize: 11, color: '#5a4a7a', marginTop: 6 }}>
          연체자를 처리하셨습니다. 새 페이지를 받으세요.
        </div>
      </div>

      {/* 구분선 */}
      <div style={{
        width: '60%', height: 1,
        background: 'linear-gradient(90deg, transparent, #9B7EC866, transparent)',
        margin: '12px 0 24px',
      }} />

      {/* 카드 3장 */}
      <div style={{
        display: 'flex',
        gap: 12,
        justifyContent: 'center',
        flex: 1,
        alignItems: 'flex-start',
        paddingTop: 8,
      }}>
        {cards.map((card) => {
          const s = TYPE_STYLE[card.type] || TYPE_STYLE.skill
          const isSelected = selected === card.id
          return (
            <button
              key={card.id}
              onClick={() => setSelected(isSelected ? null : card.id)}
              style={{
                width: 88,
                minHeight: 130,
                background: isSelected ? '#2a1a4a' : s.bg,
                border: `2px solid ${isSelected ? '#C8A0FF' : s.border}`,
                borderRadius: 6,
                padding: '8px 6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                transform: isSelected ? 'translateY(-8px) scale(1.04)' : 'none',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 0 20px 4px rgba(155,126,200,0.4)' : 'none',
                touchAction: 'manipulation',
              }}
            >
              {/* 비용 */}
              <div style={{
                alignSelf: 'flex-start',
                width: 22, height: 22,
                background: '#1a2a4a',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 'bold',
                color: '#80CFFF',
                border: '1px solid #2980B9',
              }}>
                {card.cost}
              </div>

              {/* 타입 라벨 */}
              <div style={{ fontSize: 10, color: s.labelColor, letterSpacing: 1 }}>
                {s.label}
              </div>

              {/* 카드명 */}
              <div style={{
                fontSize: 11, color: '#E8E8E8',
                textAlign: 'center', lineHeight: 1.4,
                wordBreak: 'keep-all', fontWeight: 'bold',
              }}>
                {card.name}
              </div>

              {/* 설명 */}
              <div style={{
                fontSize: 9, color: '#999',
                textAlign: 'center', lineHeight: 1.4,
                marginTop: 'auto',
              }}>
                {card.description}
              </div>

              {/* QTE 보너스 힌트 */}
              {card.qteEffect && (
                <div style={{
                  fontSize: 8, color: '#7B9EC8',
                  textAlign: 'center', lineHeight: 1.3,
                  borderTop: '1px solid #333',
                  paddingTop: 4, width: '100%',
                }}>
                  QTE: {describeQteEffect(card.qteEffect)}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* 버튼 영역 */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 10,
        marginTop: 24, width: '100%',
      }}>
        <button
          onClick={() => handleNext(selected)}
          disabled={!selected}
          style={{
            width: '70%', padding: '11px 0',
            background: selected ? 'rgba(155,126,200,0.2)' : 'transparent',
            border: `1.5px solid ${selected ? '#9B7EC8' : '#333'}`,
            color: selected ? '#C8A0FF' : '#444',
            fontSize: 13, letterSpacing: 2,
            cursor: selected ? 'pointer' : 'not-allowed',
            borderRadius: 24,
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
        >
          {selected ? '페이지 추가' : '카드를 선택하세요'}
        </button>

        <button
          onClick={() => handleNext(null)}
          style={{
            background: 'transparent', border: 'none',
            color: '#4a3a6a', fontSize: 11,
            cursor: 'pointer', padding: '4px 8px',
            letterSpacing: 1, fontFamily: 'inherit',
          }}
        >
          건너뛰기
        </button>
      </div>

    </div>
  )
}

function describeQteEffect(qte) {
  if (qte.damage) return `${qte.damage} 데미지${qte.hits ? ` ×${qte.hits}` : ''}`
  if (qte.block)  return `방어도 ${qte.block}`
  if (qte.dot)    return `DoT ${qte.dot}`
  if (qte.stun)   return `기절 ${qte.stun}턴`
  if (qte.search) return `카드 ${qte.search}장 탐색`
  return ''
}
