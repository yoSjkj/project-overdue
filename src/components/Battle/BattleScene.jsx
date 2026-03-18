import { useEffect, useState, useCallback } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { useBattleStore } from '../../stores/battleStore'
import { useDeckStore } from '../../stores/deckStore'
import { useIntroStore } from '../../stores/introStore'
import { useTutorial } from '../../hooks/useTutorial'
import EnemyDisplay from './EnemyDisplay'
import PlayerStatus from './PlayerStatus'
import Hand from '../Card/Hand'
import QTEOverlay from '../QTE/QTEOverlay'
import TutorialOpening from './TutorialOpening'
import DialogueBox from '../common/DialogueBox'

// 튜토리얼 전용 약한 적
const TUTORIAL_ENEMY = {
  id: 'tutorial_bookmark',
  name: '촉수 북마크',
  hp: 15, maxHp: 15,
  pattern: ['attack', 'attack'],
  attack: 3,
  color: '#4B0082',
}

export default function BattleScene() {
  const { player, isTutorialDone, pendingEnemy,
          takeDamage, gainBlock, resetBlock,
          completeTutorial, completeBattle } = useGameStore()

  const { phase, enemy, ink, maxInk, selectedCard, log,
          startBattle, selectCard, cancelQTE, applyCardEffect,
          getEnemyAction, processEnemyTurn, peekIntent } = useBattleStore()

  const { hand, deck, discard,
          initDeck, initTutorialDeck, drawCards, playCard, discardHand } = useDeckStore()

  const { tutorialOpeningDone, completeTutorialOpening } = useIntroStore()

  const isFirstBattle = !isTutorialDone
  const [lastQTEResult, setLastQTEResult] = useState(null)

  // 튜토리얼 힌트 훅 (순수 오버레이)
  const { dialogue: tutDialogue, pulsedCardType, clearDialogue } = useTutorial({
    enabled: isFirstBattle,
    player,
    phase,
    turn: useBattleStore(s => s.turn),
    hand,
    lastQTEResult,
  })

  // ── 초기화 ────────────────────────────────────────────────────────
  useEffect(() => {
    const enemy = isFirstBattle ? TUTORIAL_ENEMY : (pendingEnemy ?? TUTORIAL_ENEMY)
    startBattle(enemy, { unlimitedInk: isFirstBattle })

    if (isFirstBattle) {
      initTutorialDeck()
      // 손패는 TutorialOpening 완료 후 보여줌 (tutorialOpeningDone 체크)
    } else {
      initDeck()
      drawCards(5)
    }
  }, [])

  // TutorialOpening 완료 → 손패 보여주기
  const handleTutorialOpeningDone = useCallback(() => {
    completeTutorialOpening()
    // initTutorialDeck이 이미 손패에 3장 넣었으므로 추가 drawCards 불필요
  }, [completeTutorialOpening])

  // ── 카드 선택 ─────────────────────────────────────────────────────
  const handleCardClick = useCallback((card) => {
    if (phase !== 'player_turn') return
    if (!isFirstBattle && card.cost > ink) return
    setLastQTEResult(null)
    selectCard(card)
  }, [phase, ink, isFirstBattle, selectCard])

  // ── QTE 결과 처리 ─────────────────────────────────────────────────
  const handleQTEResult = useCallback((result) => {
    if (!selectedCard) return
    const card = selectedCard

    applyCardEffect(card, result)
    setLastQTEResult(result)

    const effect = result === 'perfect' ? card.qteEffect : card.effect
    if (effect.block) gainBlock(effect.block)

    playCard(card.uid)
  }, [selectedCard, applyCardEffect, gainBlock, playCard])

  // ── 턴 종료 ───────────────────────────────────────────────────────
  const handleEndTurn = useCallback(() => {
    if (phase !== 'player_turn') return

    discardHand()
    const action = getEnemyAction()
    processEnemyTurn(action)
    if (action?.type === 'attack') takeDamage(action.value)
    resetBlock()
    drawCards(isFirstBattle ? 3 : 5)
  }, [phase, discardHand, getEnemyAction, processEnemyTurn, takeDamage, resetBlock, drawCards, isFirstBattle])

  // ── 패배 감지 ─────────────────────────────────────────────────────
  useEffect(() => {
    if (player.hp <= 0 && phase !== 'defeat') {
      useBattleStore.setState({ phase: 'defeat' })
    }
  }, [player.hp, phase])

  // ── 승리 처리 ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'victory') return
    if (isFirstBattle) completeTutorial()

    // 보상 풀 생성 (임시: 랜덤 3장)
    const allCardIds = ['flame_script', 'ink_explosion', 'paper_crane',
                        'overdue_fee', 'hardcover_wall', 'bookmark_barrier',
                        'index_search', 'librarian_shush']
    const pool = [...allCardIds].sort(() => Math.random() - 0.5).slice(0, 3)

    const timer = setTimeout(() => completeBattle(pool), 1800)
    return () => clearTimeout(timer)
  }, [phase])

  // ── 렌더링 ────────────────────────────────────────────────────────
  const intent = enemy ? peekIntent() : null
  const showOpeningOverlay = isFirstBattle && !tutorialOpeningDone
  const handVisible = !isFirstBattle || tutorialOpeningDone

  if (phase === 'defeat') {
    return (
      <div style={resultStyle('#1a0a0a', '#B71C1C')}>
        <div style={{ fontSize: 20, color: '#FF5252', fontWeight: 'bold' }}>열람 종료</div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>다음 열람자를 기다리겠습니다.</div>
        <button style={resultBtn('#B71C1C', '#FF5252')}
          onClick={() => useGameStore.getState().startNewRun()}>
          다시 시작
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

      {/* 상단 정보 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '6px 12px', fontSize: 11, color: '#555',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <span>{isFirstBattle ? '이면세계 서점' : `${useBattleStore.getState().turn - 1}층`}</span>
        <span>덱 {deck.length} | 버림 {discard.length}</span>
      </div>

      {/* 적 */}
      <div style={{ flex: '0 0 auto' }}>
        <EnemyDisplay enemy={enemy} intent={intent} />
      </div>

      {/* 플레이어 상태 */}
      <PlayerStatus
        hp={player.hp} maxHp={player.maxHp}
        block={player.block} ink={ink} maxInk={maxInk}
      />

      {/* 전투 로그 */}
      <div style={{
        padding: '5px 12px', minHeight: 36,
        fontSize: 11, color: '#777',
        background: '#080808', borderBottom: '1px solid #1a1a1a',
        overflow: 'hidden',
      }}>
        {log[log.length - 1] || '...'}
      </div>

      {/* 손패 */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '8px 0',
                    opacity: handVisible ? 1 : 0, transition: 'opacity 0.3s' }}>
        <Hand
          cards={hand}
          onCardClick={handleCardClick}
          currentInk={isFirstBattle ? 99 : ink}
          disabled={phase !== 'player_turn' || showOpeningOverlay}
          pulsedCardType={pulsedCardType}
        />
      </div>

      {/* 턴 종료 */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleEndTurn}
          disabled={phase !== 'player_turn' || showOpeningOverlay}
          style={{
            padding: '8px 20px',
            background: (phase === 'player_turn' && !showOpeningOverlay) ? '#1a2a1a' : '#111',
            border: `1px solid ${(phase === 'player_turn' && !showOpeningOverlay) ? '#2E7D32' : '#333'}`,
            color: (phase === 'player_turn' && !showOpeningOverlay) ? '#81C784' : '#555',
            fontSize: 12, cursor: 'pointer', borderRadius: 2,
          }}
        >
          턴 종료
        </button>
      </div>

      {/* ── 오버레이 레이어 (전투 로직과 독립) ── */}

      {/* 튜토리얼 오프닝 대화 (블로킹) */}
      {showOpeningOverlay && (
        <TutorialOpening onComplete={handleTutorialOpeningDone} />
      )}

      {/* 튜토리얼 힌트 대화 (논블로킹) */}
      {!showOpeningOverlay && tutDialogue && (
        <DialogueBox
          dialogue={tutDialogue}
          autoDelay={0}
          onDone={clearDialogue}
        />
      )}

      {/* QTE */}
      {phase === 'qte' && selectedCard && (
        <QTEOverlay
          card={selectedCard}
          onResult={handleQTEResult}
          generous={isFirstBattle}
        />
      )}
    </div>
  )
}

const resultStyle = (bg, border) => ({
  position: 'absolute', inset: 0, background: bg, border: `1px solid ${border}`,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  gap: 12, zIndex: 200,
})
const resultBtn = (bg, color) => ({
  marginTop: 16, padding: '10px 24px', background: bg,
  border: `1px solid ${color}`, color, fontSize: 13, cursor: 'pointer', borderRadius: 2,
})
