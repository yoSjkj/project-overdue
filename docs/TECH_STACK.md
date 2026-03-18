# 금서의 서점 — 기술 스택

## 코어

| 항목 | 버전/비고 |
|------|-----------|
| Vite | 빌드 도구 |
| React | 18+ |
| TypeScript | 전체 코드베이스 |
| Zustand | 상태 관리, **immer 미들웨어** 적용 |

## 스타일 / 애니메이션

| 항목 | 용도 |
|------|------|
| Tailwind CSS | UI 레이어 (카드 손패, HP바, 메뉴 등) |
| HTML5 Canvas | 전투 렌더링 (적 스프라이트, 공격 이펙트, QTE 연출) |
| Framer Motion | 카드 / UI 애니메이션 |

## 사운드

| 항목 | 용도 |
|------|------|
| Howler.js | BGM + 효과음 |

## 배포 / PWA

| 항목 | 용도 |
|------|------|
| Cloudflare Pages | 호스팅 |
| vite-plugin-pwa | PWA (manifest + service worker) |

---

## 현재 구현 상태 (2026-03-18 기준)

> 아직 TypeScript 미전환, immer/Framer Motion 미적용 상태.
> JS로 프로토타입 진행 중이며, 기능 검증 후 마이그레이션 예정.

### 완료
- Vite + React 18 + Zustand 기본 세팅
- 스토어 구조 확정: `gameStore` / `battleStore` / `deckStore` / `introStore`
- 전투 루프 (카드 선택 → QTE → 데미지 → 적 턴)
- 인트로 시퀀스 (타이틀 → 일상 서점 → 전환 연출 → 첫 전투)
- 튜토리얼 오버레이 (`useTutorial` hook, 전투 로직과 분리)
- `DialogueBox` 타이핑 효과 컴포넌트

### 미완성 (다음 작업)
- TypeScript 전환
- immer 미들웨어 적용
- Framer Motion 카드 애니메이션
- HTML5 Canvas 전투 렌더링 레이어
- 보상 화면 (RewardScreen)
- 층 진행 맵 (MapScreen)
- 상점 (ShopScreen)
- Howler.js 사운드
- PWA 세팅
- Cloudflare Pages 배포

---

## 마이그레이션 메모

### JS → TypeScript

```bash
npm install -D typescript @types/react @types/react-dom
```

- `jsconfig.json` → `tsconfig.json`
- `.jsx` → `.tsx`, `.js` → `.ts`
- Zustand 스토어에 타입 정의 필요

### Zustand immer 미들웨어

```bash
npm install immer
```

```ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

const useGameStore = create<GameState>()(
  immer((set) => ({
    // set 내부에서 직접 state 뮤테이션 가능
    takeDamage: (amount) => set((state) => {
      state.player.hp -= amount
    }),
  }))
)
```

### Framer Motion

```bash
npm install framer-motion
```

주요 적용 예정 위치:
- `Card.jsx` — 카드 드로우/사용 애니메이션
- `QTEOverlay.jsx` — 판정 결과 연출
- `EnemyDisplay.jsx` — 피격 흔들림
- `TransitionEffect.jsx` — 현재 CSS/rAF 구현을 Motion으로 대체 가능

### vite-plugin-pwa

```bash
npm install -D vite-plugin-pwa
```

```ts
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '금서의 서점',
        short_name: 'Overdue',
        theme_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
      },
    }),
  ],
})
```
