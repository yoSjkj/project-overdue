import { create } from 'zustand'

export const useGameStore = create((set, get) => ({
  // ── 라우팅 (단일 소스) ──────────────────────────────────────────
  // 'title' | 'intro' | 'transition' | 'battle' | 'reward' | 'map' | 'shop' | 'gameover' | 'victory'
  scene: 'intro',

  // ── 플레이어 상태 ────────────────────────────────────────────────
  player: {
    hp: 60,
    maxHp: 60,
    block: 0,
    gold: 0,
  },

  // ── 런 진행 ──────────────────────────────────────────────────────
  floor: 1,
  room: 0,
  isTutorialDone: false,

  // ── 씬 간 데이터 전달 ─────────────────────────────────────────────
  pendingEnemy: null,       // 다음 전투할 적
  pendingRewardPool: [],    // 보상 화면에 보여줄 카드 ID 배열

  // ── 씬 전환 ──────────────────────────────────────────────────────
  setScene: (scene) => set({ scene }),

  enterBattle: (enemy) => set({ pendingEnemy: enemy, scene: 'battle' }),

  completeBattle: (rewardPool) => set({
    pendingRewardPool: rewardPool,
    scene: 'reward',
  }),

  completeTutorial: () => set({ isTutorialDone: true }),

  // ── 플레이어 전투 액션 ────────────────────────────────────────────
  takeDamage: (amount) => set((state) => {
    const { player } = state
    const absorbed = Math.min(player.block, amount)
    return {
      player: {
        ...player,
        block: player.block - absorbed,
        hp: Math.max(0, player.hp - (amount - absorbed)),
      },
    }
  }),

  gainBlock: (amount) => set((state) => ({
    player: { ...state.player, block: state.player.block + amount },
  })),

  resetBlock: () => set((state) => ({
    player: { ...state.player, block: 0 },
  })),

  healPlayer: (amount) => set((state) => ({
    player: {
      ...state.player,
      hp: Math.min(state.player.maxHp, state.player.hp + amount),
    },
  })),

  // ── 런 초기화 ─────────────────────────────────────────────────────
  startNewRun: () => set({
    scene: 'intro',
    player: { hp: 60, maxHp: 60, block: 0, gold: 0 },
    floor: 1,
    room: 0,
    isTutorialDone: false,
    pendingEnemy: null,
    pendingRewardPool: [],
  }),
}))
