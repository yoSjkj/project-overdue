import { useState, useEffect } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { useIntroStore } from '../../stores/introStore'
import DialogueBox from '../common/DialogueBox'
import bgImg from '../../../docs/concept-art/bg.png'
import spriteImg from '../../../docs/concept-art/girl_mini_rm.png'

const STEP_DIALOGUES = [
  null,
  { speaker: 'player', text: '책이 뒤 섞여있네...' },
  { speaker: 'player', text: '손님은 없고 책만 많고...' },
  { speaker: 'player', text: '이 책은 뭐지...?' },
]

// ── 스프라이트 시트 상수 (girl_mini_rm.png: 768 × 1291) ──────────────
// 헤더 텍스트("쯔꾸르 스프라이트 시트...") 높이 추정 — 프레임 위치가 어긋나면 조정
const SP_HEADER = 75
const SP_COLS   = 3
const SP_ROWS   = 4
const CELL_W    = 768 / SP_COLS                       // 256px
const CELL_H    = (1291 - SP_HEADER) / SP_ROWS        // ≈ 304px
const SCALE     = 0.35                                // 표시 배율 (크기 조절)
const D_W       = Math.round(CELL_W * SCALE)          // 표시 너비 ≈ 90px
const D_H       = Math.round(CELL_H * SCALE)          // 표시 높이 ≈ 106px

// 4행(뒷모습)의 시작 Y 좌표 (원본 픽셀)
const BACK_ROW_Y = SP_HEADER + 3 * CELL_H

// 걷기 애니메이션: 열 인덱스 순서 (왼발→중앙→오른발→중앙)
const WALK_FRAMES = [0, 1]

export default function IntroScreen() {
  const { introStep, nextIntroStep } = useIntroStore()
  const setScene = useGameStore(s => s.setScene)
  const [dialogueDone, setDialogueDone]   = useState(false)
  const [btnDisabled, setBtnDisabled]     = useState(false)
  const [walkFrame, setWalkFrame]         = useState(1) // 1 = 중앙(idle)

  const isLastStep = introStep === 3
  const btnText    = isLastStep ? '꺼내보기' : '책 정리하기'
  const dialogue   = STEP_DIALOGUES[introStep] ?? null
  const canPress   = !dialogue || dialogueDone
  const isIdle     = introStep === 0 || introStep >= 3

  // step 1~2: 걷기 프레임 순환
  useEffect(() => {
    if (isIdle) { setWalkFrame(1); return }
    let i = 0
    const id = setInterval(() => {
      i = (i + 1) % WALK_FRAMES.length
      setWalkFrame(WALK_FRAMES[i])
    }, 600)
    return () => clearInterval(id)
  }, [introStep]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBtn = () => {
    if (btnDisabled || !canPress) return
    if (introStep < 3) {
      setDialogueDone(false)
      nextIntroStep()
    } else {
      setBtnDisabled(true)
      setScene('transition')
    }
  }

  // 현재 프레임의 원본 이미지 X 오프셋
  const frameX = walkFrame * CELL_W

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>

      {/* ── 배경 이미지 ── */}
      <img
        src={bgImg}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

      {/* ── 주인공 스프라이트 (뒷모습) ── */}
      <div style={{
        position: 'absolute',
        bottom: '28%',
        left: '50%',
        transform: 'translateX(-50%)',
        animation: isIdle ? 'breathe 2.5s ease-in-out infinite' : undefined,
        zIndex: 2,
        width: D_W,
        height: D_H,
        backgroundImage: `url(${spriteImg})`,
        backgroundSize: `${Math.round(800 * SCALE)}px ${Math.round(1291 * SCALE)}px`,
        backgroundPosition: `-${Math.round(frameX * SCALE)}px -${Math.round(BACK_ROW_Y * SCALE)}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }} />

      {/* ── step 3: 이상한 책 글로우 ── */}
      {introStep === 3 && (
        <div style={{
          position: 'absolute',
          top: '28%',
          right: '18%',
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: 'rgba(212,160,23,0.9)',
          animation: 'pulse-book 1.2s ease-in-out infinite',
          zIndex: 3,
        }} />
      )}

      {/* ── 버튼 ── */}
      <div style={{
        position: 'absolute',
        bottom: dialogue ? 108 : 32,
        left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
        transition: 'bottom 0.25s ease',
        zIndex: 10,
      }}>
        <button
          onClick={handleBtn}
          disabled={btnDisabled || !canPress}
          style={{
            padding: '11px 32px',
            background: isLastStep ? 'rgba(155,126,200,0.25)' : 'rgba(255,255,255,0.70)',
            border: `1.5px solid ${isLastStep ? '#9B7EC8' : '#C4A882'}`,
            color: isLastStep ? '#7B5EA7' : '#8B6914',
            fontSize: 14,
            letterSpacing: 2,
            cursor: (btnDisabled || !canPress) ? 'not-allowed' : 'pointer',
            opacity: (btnDisabled || !canPress) ? 0.45 : 1,
            borderRadius: 24,
            backdropFilter: 'blur(6px)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s',
            fontFamily: 'inherit',
          }}
        >
          {btnText}
        </button>
      </div>

      {/* ── 대사 ── */}
      {dialogue && (
        <DialogueBox
          key={introStep}
          dialogue={dialogue}
          autoDelay={0}
          onDone={() => setDialogueDone(true)}
        />
      )}

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50%       { transform: translateX(-50%) translateY(-3px); }
        }
        @keyframes pulse-book {
          0%, 100% { box-shadow: 0 0 6px 2px rgba(212,160,23,0.4); opacity: 0.8; }
          50%       { box-shadow: 0 0 18px 7px rgba(155,126,200,0.75); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
