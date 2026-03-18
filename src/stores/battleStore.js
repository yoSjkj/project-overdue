import { create } from 'zustand'

export const useBattleStore = create((set, get) => ({
  phase: 'player_turn', // 'player_turn' | 'qte' | 'victory' | 'defeat'
  enemy: null,
  turn: 1,
  ink: 3,
  maxInk: 3,
  selectedCard: null,
  log: [],

  startBattle: (enemyData, { unlimitedInk = false } = {}) => set({
    enemy: { ...enemyData, currentHp: enemyData.currentHp ?? enemyData.hp },
    phase: 'player_turn',
    turn: 1,
    ink: unlimitedInk ? 99 : 3,
    maxInk: unlimitedInk ? 99 : 3,
    selectedCard: null,
    log: [],
  }),

  selectCard: (card) => set({ selectedCard: card, phase: 'qte' }),
  cancelQTE: () => set({ selectedCard: null, phase: 'player_turn' }),

  // 카드 효과 적용 (적 대상). 플레이어 효과(block 등)는 BattleScene에서 처리.
  applyCardEffect: (card, qteResult) => {
    const effect = qteResult === 'perfect' ? card.qteEffect : card.effect

    set((state) => {
      let enemy = { ...state.enemy }
      const messages = []

      if (effect.damage != null) {
        const hits = effect.hits || 1
        const total = effect.damage * hits
        const absorbed = Math.min(enemy.block || 0, total)
        if (absorbed > 0) enemy.block -= absorbed
        enemy.currentHp = Math.max(0, enemy.currentHp - (total - absorbed))
        const suffix = qteResult === 'perfect' ? ' ✦' : ''
        messages.push(`${card.name}: ${total - absorbed} 데미지${suffix}`)
      }

      if (effect.dot) {
        enemy.dot = (enemy.dot || 0) + effect.dot
        enemy.dotDuration = Math.max(enemy.dotDuration || 0, effect.dotDuration || 3)
        messages.push(`연체료: 매 턴 ${effect.dot} 데미지`)
      }

      if (effect.stun) {
        enemy.stunned = (enemy.stunned || 0) + effect.stun
        messages.push(`행동 불가 ${effect.stun}턴`)
      }

      return {
        enemy,
        ink: Math.max(0, state.ink - card.cost),
        phase: enemy.currentHp <= 0 ? 'victory' : 'player_turn',
        selectedCard: null,
        log: [...state.log.slice(-4), ...messages],
      }
    })
  },

  // 현재 턴의 적 행동 반환 (processEnemyTurn 전에 호출)
  getEnemyAction: () => {
    const { enemy, turn } = get()
    if (!enemy) return null
    if (enemy.stunned > 0) return { type: 'stunned' }

    const hpRatio = enemy.currentHp / (enemy.maxHp || enemy.hp)
    const inPhase2 = enemy.phase2Threshold && hpRatio <= enemy.phase2Threshold
    const pattern = (inPhase2 && enemy.phase2Pattern) ? enemy.phase2Pattern : enemy.pattern

    const action = pattern[(turn - 1) % pattern.length]
    if (action === 'attack') return { type: 'attack', value: enemy.attack }
    if (action === 'strong_attack') return { type: 'attack', value: enemy.strongAttack ?? Math.floor(enemy.attack * 1.5), strong: true }
    if (action === 'defend') return { type: 'defend', value: 8 }
    if (action === 'debuff') return { type: 'debuff' }
    return { type: 'unknown' }
  },

  // 다음 턴 인텐트 미리보기 (표시용)
  peekIntent: () => {
    const { enemy, turn } = get()
    if (!enemy) return null
    if (enemy.stunned > 0) return { type: 'stunned' }

    const hpRatio = enemy.currentHp / (enemy.maxHp || enemy.hp)
    const inPhase2 = enemy.phase2Threshold && hpRatio <= enemy.phase2Threshold
    const pattern = (inPhase2 && enemy.phase2Pattern) ? enemy.phase2Pattern : enemy.pattern

    const action = pattern[(turn - 1) % pattern.length]
    if (action === 'attack') return { type: 'attack', value: enemy.attack }
    if (action === 'strong_attack') return { type: 'attack', value: enemy.strongAttack ?? Math.floor(enemy.attack * 1.5), strong: true }
    if (action === 'defend') return { type: 'defend', value: 8 }
    if (action === 'debuff') return { type: 'debuff' }
    return null
  },

  // 적 턴 처리 (DoT, 스턴, 턴 진행, 잉크 리셋)
  processEnemyTurn: (action) => set((state) => {
    let enemy = { ...state.enemy }
    const messages = []

    if (enemy.dot > 0) {
      enemy.currentHp = Math.max(0, enemy.currentHp - enemy.dot)
      messages.push(`연체료: ${enemy.dot} 데미지`)
      enemy.dotDuration -= 1
      if (enemy.dotDuration <= 0) { enemy.dot = 0; enemy.dotDuration = 0 }
    }

    if (enemy.stunned > 0) enemy.stunned -= 1

    if (action?.type === 'defend') {
      enemy.block = (enemy.block || 0) + action.value
      messages.push(`연체자 방어: +${action.value}`)
    }

    if (action?.type === 'attack') {
      const label = action.strong ? '강공격' : '공격'
      messages.push(`연체자 ${label}: ${action.value} 데미지`)
    }

    if (action?.type === 'stunned') {
      messages.push('연체자 행동 불가')
    }

    return {
      enemy,
      turn: state.turn + 1,
      ink: state.maxInk,
      phase: enemy.currentHp <= 0 ? 'victory' : 'player_turn',
      log: [...state.log.slice(-4), ...messages],
    }
  }),

  addLog: (msg) => set((state) => ({
    log: [...state.log.slice(-4), msg],
  })),
}))
