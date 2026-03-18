# (제목 미정) (Overdue)

> 평범한 서점 알바의 하루.
> 수많은 사람들 사이에서 책을 정리하고, 재고를 확인하고.
> 오늘도 똑같은 하루.
>
> 그 책을 꺼낸 순간, 서점이 이상해졌다.
> 사람들은 전부 사라지고,
> 책장 사이에서 뭔가가 움직이고,
> 손에 들린 책이 말을 걸어온다.
>
> *"안녕하세요, 열람자님. 제가 안내해드리겠습니다."*
>
> 나가고 싶다. 집에 가고 싶다.
> 이 책이 있으니까, 괜찮겠지?

---

미니 덱빌딩 로그라이크 모바일 PWA 게임.

---

## 게임 개요

- **장르**: 덱빌딩 로그라이크 (Slay the Spire류)
- **플랫폼**: 모바일 웹 (PWA, 세로 360×640)
- **핵심 메카닉**: 카드 선택 → QTE 타이밍 판정 → 데미지/방어 결정
- **테마**: 서점 / 도서관 / 이면세계

## 기술 스택

| 항목 | 내용 |
|------|------|
| Vite + React 18 | 빌드 / UI |
| Zustand | 상태 관리 (4 스토어) |
| Tailwind CSS | 스타일 (예정) |
| Framer Motion | 카드 애니메이션 (예정) |
| Howler.js | 사운드 (예정) |
| Cloudflare Pages + vite-plugin-pwa | 배포 (예정) |

> 현재 JS 프로토타입 단계. TypeScript / immer 미전환 상태.
> 자세한 내용: [docs/TECH_STACK.md](docs/TECH_STACK.md)

## 씬 흐름

```
intro (서점) → transition (이면세계 전환 연출) → battle (전투)
  → reward (카드 보상) → battle (다음 전투) → ...
```

- 첫 실행 시 타이틀 없이 서점 화면부터 바로 시작
- 첫 전투는 튜토리얼 (카드 3장, 잉크 무제한, 관대한 QTE)

## 스토어 구조

| 스토어 | 역할 |
|--------|------|
| `gameStore` | 씬 라우팅 (단일 소스), 플레이어 HP/골드, 런 진행 |
| `battleStore` | 전투 루프 (턴/페이즈/잉크/적 상태) |
| `deckStore` | 덱/손패/버림 더미/소모 관리 |
| `introStore` | 인트로 스텝, 튜토리얼 오프닝 완료 여부 |

## 프로젝트 구조

```
src/
├── App.jsx                  # 씬 라우터
├── stores/                  # Zustand 스토어 4개
├── hooks/
│   └── useTutorial.js       # 튜토리얼 힌트 (순수 오버레이)
├── components/
│   ├── Intro/               # IntroScreen, TransitionEffect
│   ├── Battle/              # BattleScene, EnemyDisplay, TutorialOpening
│   ├── Card/                # Card, Hand
│   ├── QTE/                 # QTEOverlay
│   ├── Reward/              # RewardScreen
│   └── common/              # DialogueBox
└── data/
    └── cards.json           # 카드 데이터 (11종)

docs/
├── concept-art/             # 컨셉아트 이미지 (주인공, 안내서, 서점)
├── INTRO_SPEC.md            # 인트로 시퀀스 상세 명세
├── STEP_BY_STEP.md          # 단계별 구현 가이드 (현재 Step 6 완료)
└── TECH_STACK.md            # 기술 스택 및 마이그레이션 메모
```

## 현재 구현 상태

- [x] Step 1: 씬 라우팅 + 스토어 구조
- [x] Step 2: 인트로 화면 (대사 + 버튼)
- [x] Step 3: 전환 연출 (화면 흔들림 + 백색 플래시)
- [x] Step 4: 첫 전투 + 튜토리얼 오프닝 대화
- [x] Step 5: 전투 중 튜토리얼 힌트 (useTutorial 훅)
- [x] Step 6: 카드 보상 화면
- [ ] Step 7: 2번째 전투 (정상 규칙)
- [ ] Step 8~: 보스전, 맵, 상점, 사운드, 배포

## 개발 실행

```bash
npm run dev
```
