# 단계별 구현 가이드 (STEP_BY_STEP.md)

이 문서는 "금서의 서점" 게임을 단계별로 구현하기 위한 지시서입니다.
**반드시 한 단계씩 완료하고, 정상 동작을 확인한 후 다음 단계로 넘어갈 것.**
한 번에 여러 단계를 동시에 구현하지 마세요.

참조 문서:
- docs/INTRO_SPEC.md: 인트로 상세 명세
- docs/TECH_STACK.md: 기술 스택 및 마이그레이션 메모 (TypeScript, immer, Framer Motion 전환 시점 참고)
- docs/concept-art/: 컨셉아트 이미지

---

## ✅ Step 1: 뼈대 — 씬 라우팅 + 빈 컴포넌트 + 스토어 구조 (완료)

### 목표
화면 전환이 정상 동작하는 것만 확인. UI/로직 없어도 됨.

### 할 일

1. **gameStore.js** 생성
   - `scene` 상태: `'title'` | `'intro'` | `'transition'` | `'battle'` | `'reward'` | `'gameover'` | `'victory'`
   - `setScene(scene)` 액션
   - `player`: `{ hp: 60, maxHp: 60, gold: 0 }`
   - `floor`: 1, `room`: 0
   - `isTutorialDone`: false
   - `pendingEnemy`: null
   - 초기 scene: `'intro'` (타이틀 화면 스킵, 서점 화면부터 바로 시작)

2. **introStore.js** 생성
   - `introStep`: 0 (0~4)
   - `nextIntroStep()` 액션
   - `resetIntro()` 액션

3. **battleStore.js** — 기존 있으면 유지. 없으면 빈 스토어만

4. **deckStore.js** — 기존 있으면 유지. 없으면 빈 스토어만

5. **빈 컴포넌트** 생성 (각각 자기 이름만 표시하면 됨)
   - `TitleScreen.jsx` → "타이틀 화면" + "시작" 버튼 (→ scene: 'intro')
   - `IntroScreen.jsx` → "인트로 화면" + "다음" 버튼 (→ scene: 'transition')
   - `TransitionEffect.jsx` → "전환 중..." 텍스트 + 2초 후 자동으로 (→ scene: 'battle')
   - `BattleScreen.jsx` → "전투 화면" 텍스트만

6. **App.jsx** — `gameStore.scene`에 따라 컴포넌트 분기
   ```jsx
   const scene = useGameStore(s => s.scene);
   switch(scene) {
     case 'title': return <TitleScreen />;
     case 'intro': return <IntroScreen />;
     case 'transition': return <TransitionEffect />;
     case 'battle': return <BattleScreen />;
     // ...
   }
   ```

### 확인 사항
- [ ] 타이틀 → 인트로 → 전환 → 전투 화면이 순서대로 전환되는가?
- [ ] 뒤로 가거나 엉뚱한 화면이 뜨지 않는가?
- [ ] 각 스토어가 독립적으로 동작하는가?

### 완료 후 알려줘. 확인되면 Step 2로 넘어감.

---

## ✅ Step 2: 인트로 화면 — 대사 + 버튼 인터랙션 (완료)

### 목표
인트로 화면에서 버튼 탭마다 대사가 바뀌고, 마지막에 전환 트리거.

### 할 일

1. **DialogueBox.jsx** 컴포넌트 생성
   - props: `speaker` ('book' | 'player'), `text`, `onComplete`
   - 타이핑 효과: 한 글자씩 나타남 (40ms 간격)
   - "..." 은 점마다 200ms 대기
   - 탭하면 타이핑 스킵 → 전체 텍스트 즉시 표시
   - 화면 하단 반투명 검정 박스
   - 화자별 텍스트 색: 책=금색, 주인공=흰색

2. **IntroScreen.jsx** 구현
   - 배경: 어두운 베이지/아이보리 단색 (이미지 없어도 됨, 색상으로 대체)
   - 중앙: 주인공 영역 (플레이스홀더 — 색깔 네모 또는 텍스트)
   - 하단: DialogueBox + 버튼

   - **introStep 0**: 버튼 "책 정리하기" / 대사 없음
   - **introStep 1**: 탭 → 대사 "오늘도 야근이네..." (주인공) / 버튼 "책 정리하기"
   - **introStep 2**: 탭 → 대사 "손님은 없고 책만 많고..." (주인공) / 버튼 "책 정리하기"
   - **introStep 3**: 탭 → 대사 "...? 이 책은 뭐지...?" (주인공) / 버튼 텍스트 변경 → "꺼내보기"
   - **introStep 4**: 탭 → scene을 'transition'으로 변경

3. **introStore.js** 활용
   - introStep으로 현재 단계 관리
   - nextIntroStep()으로 진행

### 확인 사항
- [ ] 버튼 탭마다 대사가 순서대로 나오는가?
- [ ] 타이핑 효과가 동작하는가?
- [ ] Step 3에서 버튼 텍스트가 "꺼내보기"로 바뀌는가?
- [ ] Step 4에서 transition 화면으로 넘어가는가?

### 완료 후 알려줘. 확인되면 Step 3으로 넘어감.

---

## ✅ Step 3: 전환 연출 (완료)

### 목표
"꺼내보기" 탭 후 이면세계로 전환되는 연출. 자동 진행, 플레이어 입력 없음.

### 할 일

1. **TransitionEffect.jsx** 구현 — 아래 타임라인을 순차 실행

   ```
   0.0초  주인공 대사 영역에: (텍스트 없이 화면만)
   0.3초  화면 중앙에서 빛 확대 (CSS radial-gradient 또는 div의 box-shadow 애니메이션)
          - 색상: 금색
   0.5초  화면 흔들림 시작
          - 컨테이너에 transform translate 랜덤 (±3px → ±8px)
          - setInterval 50ms로 랜덤 값 적용
   0.8초  (선택) 글리치 느낌 — CSS filter hue-rotate 빠르게 변화
          - 구현 어려우면 스킵해도 OK
   1.0초  백색 플래시
          - 흰색 오버레이 div, opacity 0→1 (transition 0.1s)
   1.1초  배경색 변경
          - 따뜻한 베이지 → 어두운 보라/남색
          - 흰색 오버레이 opacity 1→0 (0.2초)
   1.3초  흔들림 멈춤
   1.5초  주인공 대사: "...어...? 여기가... 어디...?"
   2.5초  대사 완료 후 → scene을 'battle'로 변경
   ```

2. 구현 방식
   - async 함수 또는 setTimeout 체인
   - 각 단계를 state로 관리해도 OK (`transitionPhase: 0~6`)
   - 최소 구현: **백색 플래시 + 배경색 변경 + 대사**만으로도 충분

### 구현 우선순위
```
필수: 백색 플래시 + 배경색 변경 + 대사
권장: 화면 흔들림
선택: 글리치/RGB분리
```

### 확인 사항
- [ ] "꺼내보기" 후 자동으로 연출이 진행되는가?
- [ ] 플래시 → 배경 변화 → 대사 순서가 맞는가?
- [ ] 대사 끝나면 자동으로 battle 화면으로 넘어가는가?
- [ ] 연출 중 플레이어가 아무것도 못 누르는가? (입력 차단)

### 완료 후 알려줘. 확인되면 Step 4로 넘어감.

---

## ✅ Step 4: 첫 전투 진입 + 튜토리얼 오프닝 대화 (완료)

### 목표
전환 후 battle 화면에 진입. 전투 시작 전에 책(안내서)의 오프닝 대화가 나옴.

### 할 일

1. **TutorialOpeningDialogue.jsx** 컴포넌트 생성
   - 전투 화면 위에 오버레이로 표시
   - 대화가 끝나기 전까지 전투 UI 인터랙션 차단
   - 대사 시퀀스 (탭으로 진행):

   ```
   1. 책: "안녕하세요. 저는 안내서입니다. 열람해주셔서 감사합니다."
   2. 주인공: "...책이 말을 한다고...?"
   3. 책: "네, 물론이죠. 책이 말을 안 하면 누가 하나요?"
   4. 책: "앞에 연체자가 있네요. 제 페이지를 사용하시면 처리할 수 있습니다."
   → 대화 종료 → 오버레이 제거 → 손패에 카드 등장 → 전투 시작
   ```

2. **BattleScreen.jsx** 수정
   - `gameStore.isTutorialDone === false`이면 TutorialOpeningDialogue 오버레이 표시
   - 오버레이가 닫히면 전투 시작
   - 첫 전투 특수 규칙 적용:
     - 카드 3장만 (기본 공격 2 + 기본 방어 1)
     - 잉크 무제한 (비용 체크 안 함)
     - 적: 약한 적 (HP 15, 공격 3)
     - QTE 윈도우: ±500ms (매우 관대)

3. **gameStore.js**에 추가
   - `enterBattle(enemy)`: pendingEnemy 설정 + scene → 'battle'
   - TransitionEffect 완료 시 `enterBattle(TUTORIAL_ENEMY)` 호출

### 확인 사항
- [ ] 전환 후 전투 화면에 오프닝 대화가 나오는가?
- [ ] 대화 중 카드를 누를 수 없는가? (오버레이 차단)
- [ ] 대화 끝나면 카드 3장이 손패에 나타나는가?
- [ ] 전투가 정상적으로 진행되는가? (카드 사용 → 데미지)

### 완료 후 알려줘. 확인되면 Step 5로 넘어감.

---

## ✅ Step 5: 전투 중 튜토리얼 힌트 (useTutorial 훅) (완료)

### 목표
전투 중 책이 상황에 맞는 힌트를 줌. 전투 흐름은 건드리지 않음.

### 할 일

1. **useTutorial.js** 훅 생성
   - Input: 전투 상태 (turn, phase, playerHP, hand, lastQTEResult 등)
   - Output: `{ dialogue, pulsedCardType }`
   - **전투 흐름을 절대 제어하지 않음** — 관찰만 하고 힌트만 리턴

   - 힌트 트리거 (각각 1회만 표시, flag로 관리):
     ```
     첫 턴 시작 → 공격 카드 펄스 + 책 대사: "밝게 빛나는 페이지가 보이시죠? 가볍게 터치해주시면 됩니다."
     첫 QTE 시작 → 책 대사: "문자가 나타나면 적절한 타이밍에 터치해주세요."
     QTE 성공 → 책 대사: "훌륭하십니다."
     QTE 실패 → 책 대사: "괜찮습니다. 오역은 누구나 하는 거니까요."
     HP 감소 감지 → 주인공 대사: "아파...!!"
     적 공격 인텐트 표시 중 + 방어카드 보유 → 방어 카드 펄스 + 책 대사: "다음 공격이 예상됩니다. 방어 페이지 사용을 권장드립니다."
     적 처치 → 책 대사: "연체 도서가 회수되었습니다. 이용해주셔서 감사합니다."
     적 처치 → 주인공 대사: "뭐가 어떻게 된 거야..."
     ```

   - 각 힌트는 flag(useRef)로 "이미 보여줬는지" 관리
   - 플레이어가 힌트를 무시하고 아무 카드나 내도 전투는 정상 진행

2. **BattleScreen.jsx**에 적용
   - `const { dialogue, pulsedCardType } = useTutorial(battleState);`
   - dialogue가 있으면 DialogueBox로 표시 (non-blocking, 전투 조작 가능)
   - pulsedCardType이 있으면 해당 타입 카드에 CSS 펄스 애니메이션

### 확인 사항
- [ ] 첫 턴에 공격 카드에 펄스가 뜨는가?
- [ ] 힌트 대사가 상황에 맞게 나오는가?
- [ ] 힌트를 무시해도 전투가 정상 진행되는가?
- [ ] 각 힌트가 1번만 나오는가? (반복 안 됨)
- [ ] 전투 승리 후 isTutorialDone이 true로 바뀌는가?

### 완료 후 알려줘. 확인되면 Step 6으로 넘어감.

---

## ✅ Step 6: 전투 승리 → 카드 보상 화면 (완료)

### 목표
첫 전투 승리 후 카드 보상 선택 화면.

### 할 일

1. **RewardScreen.jsx** 생성
   - 카드 3장 표시 (랜덤 또는 고정)
   - 1장 선택 → 덱에 추가
   - "건너뛰기" 옵션
   - 선택/스킵 후 → 다음 전투 또는 맵 화면으로

2. **gameStore.js**
   - `pendingRewardPool`: 보상 카드 후보 배열
   - 전투 승리 시 scene → 'reward'
   - 보상 선택 후 scene → 'battle' (다음 전투) 또는 'map'

### 확인 사항
- [ ] 전투 승리 후 보상 화면이 뜨는가?
- [ ] 카드 선택 시 덱에 추가되는가?
- [ ] 스킵하면 덱 변화 없이 넘어가는가?

### 완료 후 알려줘.

---

## 이후 단계 (Step 7~)

Step 6까지 완료되면 인트로 → 첫 전투 → 보상까지 한 사이클이 돌아감.
이후:

- Step 7: 2번째 전투 (정상 규칙: 카드 5장, 잉크 3, QTE 정상)
- Step 8: 1층 보스전
- Step 9: 층 진행 시스템 (1층 → 2층 → 3층)
- Step 10: 상점
- Step 11: 사운드
- Step 12: 픽셀아트 리소스 교체
- Step 13: 밸런싱
- Step 14: PWA 세팅 + 배포

---

## 핵심 원칙 (모든 단계에 적용)

1. **한 단계씩.** 다음 단계 코드를 미리 작성하지 말 것
2. **빈 컴포넌트 OK.** 당장 안 쓰는 화면은 빈 껍데기로 둘 것
3. **gameStore.scene이 유일한 라우터.** 다른 스토어가 scene을 건드리지 말 것
4. **튜토리얼은 오버레이.** 전투 로직을 변경하지 말 것, 관찰만 할 것
5. **플레이스홀더 우선.** 색깔 네모로 동작 확인 후 나중에 아트 교체
