import { useState, useEffect, useRef } from 'react'

/**
 * 튜토리얼 힌트 훅 — 전투 로직에 영향 없는 순수 오버레이
 *
 * @param {Object} params
 * @param {boolean} params.enabled         - 튜토리얼 활성 여부 (!isTutorialDone)
 * @param {Object}  params.player          - { hp }
 * @param {string}  params.phase           - battleStore.phase
 * @param {number}  params.turn            - battleStore.turn
 * @param {Array}   params.hand            - deckStore.hand
 * @param {string|null} params.lastQTEResult - 'perfect' | 'normal' | 'fail' | null
 *
 * @returns {{ dialogue, pulsedCardType, clearDialogue }}
 *   - dialogue: { speaker, text } | null
 *   - pulsedCardType: 'attack' | 'defense' | null  (강조할 카드 타입)
 *   - clearDialogue: () => void
 */
export function useTutorial({ enabled, player, phase, turn, hand, lastQTEResult }) {
  const [dialogue, setDialogue] = useState(null)
  const [pulsedCardType, setPulsedCardType] = useState(null)

  // "이미 보여줬는지" 플래그
  const shown = useRef({
    cardHint: false,
    qteHint: false,
    qteResult: false,
    damageReaction: false,
    defenseHint: false,
    victoryHint: false,
  })
  const prevPhaseRef = useRef(phase)
  const prevHpRef = useRef(player?.hp)
  const dialogueTimerRef = useRef(null)

  const show = (d, clearAfterMs = 0) => {
    clearTimeout(dialogueTimerRef.current)
    setDialogue(d)
    if (clearAfterMs > 0) {
      dialogueTimerRef.current = setTimeout(() => setDialogue(null), clearAfterMs)
    }
  }

  // ── 힌트 1: 턴 1 시작 → 공격 카드 사용 안내 ──────────────────────
  useEffect(() => {
    if (!enabled || shown.current.cardHint) return
    if (turn === 1 && phase === 'player_turn' && hand.length > 0) {
      shown.current.cardHint = true
      setPulsedCardType('attack')
      show({ speaker: 'book', text: '밝게 빛나는 페이지가 보이시죠? 가볍게 터치해주시면 됩니다.' })
    }
  }, [enabled, turn, phase, hand.length])

  // ── 힌트 2: QTE 진입 → QTE 안내 ─────────────────────────────────
  useEffect(() => {
    if (!enabled || shown.current.qteHint) return
    if (phase === 'qte') {
      shown.current.qteHint = true
      show({ speaker: 'book', text: '문자가 나타나면 적절한 타이밍에 터치해주세요.' }, 2500)
    }
  }, [enabled, phase])

  // ── 힌트 3: QTE 결과 ─────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || shown.current.qteResult) return
    const prevPhase = prevPhaseRef.current
    prevPhaseRef.current = phase

    // qte → player_turn 전환 감지
    if (prevPhase === 'qte' && phase === 'player_turn' && lastQTEResult) {
      shown.current.qteResult = true
      setPulsedCardType(null)
      const text = lastQTEResult === 'fail'
        ? '괜찮습니다. 오역은 누구나 하는 거니까요.'
        : '훌륭하십니다.'
      show({ speaker: 'book', text }, 2000)
    }
  }, [enabled, phase, lastQTEResult])

  // ── 힌트 4: HP 감소 → 피격 반응 + 방어 안내 ─────────────────────
  useEffect(() => {
    if (!enabled) return
    const prevHp = prevHpRef.current
    prevHpRef.current = player?.hp

    if (player?.hp < prevHp && !shown.current.damageReaction) {
      shown.current.damageReaction = true
      show({ speaker: 'player', text: '아파...!!' }, 1200)

      if (!shown.current.defenseHint) {
        shown.current.defenseHint = true
        dialogueTimerRef.current = setTimeout(() => {
          setPulsedCardType('defense')
          show({ speaker: 'book', text: '다음 공격이 예상됩니다. 방어 페이지 사용을 권장드립니다.' })
        }, 1400)
      }
    }
  }, [enabled, player?.hp])

  // cleanup
  useEffect(() => () => clearTimeout(dialogueTimerRef.current), [])

  return {
    dialogue,
    pulsedCardType,
    clearDialogue: () => setDialogue(null),
  }
}
