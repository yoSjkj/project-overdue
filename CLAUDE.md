# Claude Code 작업 지침 — 금서의 서점

## 터미널 / 셸 주의사항

- **셸 프로필이 로드되지 않음**: `fnm`, `nvm` 등 환경변수가 없어서 `cd` 후 `npm`/`node` 명령이 실패할 수 있음
- **git은 `-C` 플래그 사용**: `cd` 대신 `git -C "c:/_project/project-overdue" <command>` 형태로 실행
- **npm 명령이 필요하면** 사용자에게 직접 실행 요청

## 개발 원칙

- 그래픽 에셋 없이 기능 먼저, 플레이스홀더(색깔 도형/텍스트)로 진행
- 한 Step씩 완료 확인 후 다음으로 — docs/STEP_BY_STEP.md 참고
- `gameStore.scene`이 유일한 씬 라우터, 다른 스토어가 scene 건드리지 않음
- 튜토리얼은 순수 오버레이 (`useTutorial` 훅은 관찰만, 전투 로직 제어 안 함)

## 참조 문서

- [docs/STEP_BY_STEP.md](docs/STEP_BY_STEP.md) — 단계별 구현 가이드 (현재 Step 6 완료)
- [docs/TECH_STACK.md](docs/TECH_STACK.md) — 기술 스택 및 마이그레이션 메모
- [docs/INTRO_SPEC.md](docs/INTRO_SPEC.md) — 인트로 시퀀스 상세 명세
- [docs/concept-art/](docs/concept-art/) — 컨셉아트 (주인공, 안내서, 서점)
