import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { useIntroStore } from '../../stores/introStore'
import DialogueBox from '../common/DialogueBox'

const STEP_DIALOGUES = [
  null,
  { speaker: 'player', text: '책이 뒤 섞여있네...' },
  { speaker: 'player', text: '손님은 없고 책만 많고...' },
  { speaker: 'player', text: '이 책은 뭐지...?' },
]

export default function IntroScreen() {
  const { introStep, nextIntroStep } = useIntroStore()
  const setScene = useGameStore(s => s.setScene)
  const [dialogueDone, setDialogueDone] = useState(false)
  const [btnDisabled, setBtnDisabled] = useState(false)

  const isLastStep = introStep === 3
  const btnText = isLastStep ? '꺼내보기' : '책 정리하기'
  const dialogue = STEP_DIALOGUES[introStep] ?? null
  const canPress = !dialogue || dialogueDone

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

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#FFF8ED' }}>

      {/* ── 배경 그라디언트 ── */}
      {/* TODO: <img src={bookstoreBg} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/> */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 30%, #FFFBF2 0%, #FFF3DC 60%, #F5E6C8 100%)',
      }} />

      {/* ── 바닥 ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%',
        background: 'radial-gradient(ellipse at 50% 100%, #E8C48A 0%, #DEB878 60%, #C9A55A 100%)',
        borderRadius: '60% 60% 0 0 / 20% 20% 0 0',
      }} />

      {/* ── 서가 (좌우) ── */}
      {/* TODO: 서가 스프라이트 이미지로 교체 */}
      <Bookshelf side="left" introStep={introStep} />
      <Bookshelf side="right" introStep={introStep} />

      {/* ── 주인공 (뒷모습) ── */}
      {/* TODO: 주인공 스프라이트 이미지로 교체 */}
      <div style={{
        position: 'absolute',
        bottom: '24%',
        left: '50%',
        transform: 'translateX(-50%)',
        animation: introStep < 3 ? 'breathe 2.5s ease-in-out infinite' : undefined,
      }}>
        <Character step={introStep} />
      </div>

      {/* ── 버튼 ── */}
      <div style={{
        position: 'absolute',
        bottom: dialogue ? 100 : 32,
        left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
        transition: 'bottom 0.25s ease',
      }}>
        <button
          onClick={handleBtn}
          disabled={btnDisabled || !canPress}
          style={{
            padding: '11px 32px',
            background: isLastStep ? 'rgba(155,126,200,0.18)' : 'rgba(255,255,255,0.65)',
            border: `1.5px solid ${isLastStep ? '#9B7EC8' : '#C4A882'}`,
            color: isLastStep ? '#7B5EA7' : '#8B6914',
            fontSize: 14,
            letterSpacing: 2,
            cursor: (btnDisabled || !canPress) ? 'not-allowed' : 'pointer',
            opacity: (btnDisabled || !canPress) ? 0.45 : 1,
            borderRadius: 24,
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
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
          0%, 100% { box-shadow: 0 0 6px 2px rgba(212,160,23,0.4); }
          50%       { box-shadow: 0 0 16px 6px rgba(155,126,200,0.7); }
        }
      `}</style>
    </div>
  )
}

// ── 서가 컴포넌트 ────────────────────────────────────────────────────
function Bookshelf({ side, introStep }) {
  const isLeft = side === 'left'
  const books = isLeft ? LEFT_BOOKS : RIGHT_BOOKS

  return (
    <div style={{
      position: 'absolute',
      top: '8%',
      [isLeft ? 'left' : 'right']: 0,
      width: '38%',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      padding: '0 8px',
    }}>
      {books.map((row, ri) => (
        <div key={ri}>
          {/* 선반 */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 2,
            paddingBottom: 3,
            borderBottom: '2px solid #C4A87066',
          }}>
            {row.map((book, bi) => {
              // step 3에서 이상한 책 글로우
              const isWeirdBook = introStep === 3 && !isLeft && ri === 0 && bi === 2
              return (
                <div key={bi} style={{
                  width: book.w,
                  height: book.h,
                  background: isWeirdBook ? '#9B7EC8' : book.color,
                  borderRadius: '2px 2px 0 0',
                  opacity: 0.85,
                  flexShrink: 0,
                  animation: isWeirdBook ? 'pulse-book 1.2s ease-in-out infinite' : undefined,
                }} />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── 주인공 플레이스홀더 ─────────────────────────────────────────────
function Character({ step }) {
  return (
    // TODO: <img src={characterSprite} style={{width:72,height:96}} />
    <div style={{ position: 'relative', width: 52, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 머리 (금발) */}
      <div style={{
        width: 34, height: 34,
        background: '#E8A87C',
        borderRadius: '50%',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* 금발 머리카락 */}
        <div style={{
          position: 'absolute', top: -6, left: -10, right: -10, bottom: -10,
          background: '#F5DFA0',
          borderRadius: '50% 50% 35% 35%',
          zIndex: -1,
        }} />
      </div>

      {/* 몸 (니트 + 앞치마) */}
      <div style={{
        width: 42, height: 52,
        background: '#FFE082',
        borderRadius: '6px 6px 2px 2px',
        marginTop: -8,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 앞치마 */}
        <div style={{
          position: 'absolute',
          top: 10, left: 6, right: 6, bottom: 0,
          background: '#4A3728',
          borderRadius: '4px 4px 0 0',
        }} />
        {/* 팔 (step 1~3: 들어올린 팔) */}
        {step >= 1 && (
          <div style={{
            position: 'absolute',
            top: 4, right: -10,
            width: 12, height: 28,
            background: '#FFE082',
            borderRadius: 6,
            transform: 'rotate(-30deg)',
            transformOrigin: 'top center',
          }} />
        )}
      </div>

      {/* 다리 */}
      <div style={{ display: 'flex', gap: 6, marginTop: 0 }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            width: 12, height: 20,
            background: '#E8C4A0',
            borderRadius: '0 0 4px 4px',
          }} />
        ))}
      </div>
    </div>
  )
}

// ── 책 데이터 ────────────────────────────────────────────────────────
const LEFT_BOOKS = [
  [
    { w: 10, h: 38, color: '#A0522D' },
    { w: 14, h: 42, color: '#F5F5DC' },
    { w: 8,  h: 36, color: '#6B8E23' },
    { w: 16, h: 44, color: '#8B4513' },
    { w: 10, h: 40, color: '#D2691E' },
  ],
  [
    { w: 14, h: 44, color: '#6B8E4E' },
    { w: 10, h: 36, color: '#8B7355' },
    { w: 8,  h: 40, color: '#F5DEB3' },
    { w: 16, h: 46, color: '#7B6B4E' },
    { w: 12, h: 38, color: '#A8C090' },
  ],
  [
    { w: 8,  h: 36, color: '#C8D8A0' },
    { w: 12, h: 40, color: '#8B8B6B' },
    { w: 16, h: 44, color: '#D4B896' },
    { w: 10, h: 38, color: '#7B9B5E' },
  ],
]

const RIGHT_BOOKS = [
  [
    { w: 12, h: 40, color: '#F5DEB3' },
    { w: 8,  h: 38, color: '#A08060' },
    { w: 10, h: 44, color: '#6B8E23' }, // ← step 3에서 이 책이 글로우
    { w: 14, h: 36, color: '#C8A882' },
    { w: 10, h: 42, color: '#B87333' },
  ],
  [
    { w: 10, h: 42, color: '#8B6B4E' },
    { w: 8,  h: 38, color: '#A8C090' },
    { w: 14, h: 44, color: '#9B7EC8' },
    { w: 12, h: 36, color: '#C4A882' },
  ],
  [
    { w: 14, h: 38, color: '#7B9B5E' },
    { w: 8,  h: 42, color: '#5B9BD5' },
    { w: 10, h: 36, color: '#C85B5B' },
    { w: 12, h: 44, color: '#C4A882' },
  ],
]
