import { create } from 'zustand'

// 인트로 시퀀스 전용 상태. 튜토리얼 완료 후 사실상 사용 안 함.
export const useIntroStore = create((set) => ({
  introStep: 0,                  // 0~4 (일상 서점 단계)
  tutorialOpeningDone: false,    // 첫 전투 진입 전 대화 시퀀스 완료 여부
  isTransitioning: false,        // 전환 연출 진행 중

  nextIntroStep: () => set((s) => ({ introStep: s.introStep + 1 })),
  setTransitioning: (v) => set({ isTransitioning: v }),
  completeTutorialOpening: () => set({ tutorialOpeningDone: true }),

  reset: () => set({ introStep: 0, tutorialOpeningDone: false, isTransitioning: false }),
}))
