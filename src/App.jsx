import { useGameStore } from './stores/gameStore'
import TitleScreen from './components/Title/TitleScreen'
import IntroScreen from './components/Intro/IntroScreen'
import TransitionEffect from './components/Intro/TransitionEffect'
import BattleScene from './components/Battle/BattleScene'
import RewardScreen from './components/Reward/RewardScreen'

// TODO: 구현 예정 씬들
const PlaceholderScene = ({ name }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', color: '#555', fontSize: 13 }}>
    {name} — 구현 예정
  </div>
)

export default function App() {
  const scene = useGameStore(s => s.scene)
  const { enterBattle, startNewRun } = useGameStore()

  // 전환 연출 완료 → 튜토리얼 전투 진입
  const handleTransitionComplete = () => {
    // pendingEnemy는 BattleScene이 isTutorialDone 체크해서 직접 설정
    // 여기서는 scene만 battle로 전환
    useGameStore.setState({ scene: 'battle' })
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '100vw', height: '100vh', background: '#000',
    }}>
      {/* 모바일 기준 뷰포트 */}
      <div style={{
        position: 'relative', width: 360, height: 640,
        background: '#0a0a0a', overflow: 'hidden',
        fontFamily: "'Courier New', monospace",
      }}>
        {scene === 'title'      && <TitleScreen />}
        {scene === 'intro'      && <IntroScreen />}
        {scene === 'transition' && <TransitionEffect onComplete={handleTransitionComplete} />}
        {scene === 'battle'     && <BattleScene />}
        {scene === 'reward'     && <RewardScreen />}
        {scene === 'map'        && <PlaceholderScene name="층 진행 맵" />}
        {scene === 'shop'       && <PlaceholderScene name="상점" />}
        {scene === 'gameover'   && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', height: '100%', gap: 16 }}>
            <div style={{ fontSize: 18, color: '#FF5252' }}>게임 오버</div>
            <button onClick={startNewRun}
              style={{ padding: '10px 24px', background: 'transparent',
                       border: '1px solid #B71C1C', color: '#FF5252',
                       fontSize: 13, cursor: 'pointer' }}>
              처음부터
            </button>
          </div>
        )}
        {scene === 'victory' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', height: '100%', gap: 16 }}>
            <div style={{ fontSize: 18, color: '#69F0AE' }}>반납 완료</div>
            <div style={{ fontSize: 12, color: '#555' }}>다음에 또 들러주세요.</div>
            <button onClick={startNewRun}
              style={{ padding: '10px 24px', background: 'transparent',
                       border: '1px solid #1B5E20', color: '#69F0AE',
                       fontSize: 13, cursor: 'pointer' }}>
              처음부터
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
