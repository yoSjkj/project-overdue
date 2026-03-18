import { useEffect, useRef, useState } from 'react'

/**
 * 전환 연출: 흔들림 → 글리치(간단) → 백색 플래시 → 이면세계 배경
 * 완료 후 onComplete() 호출
 */
export default function TransitionEffect({ onComplete }) {
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 })
  const [flashOpacity, setFlashOpacity] = useState(0)
  const [isOtherworld, setIsOtherworld] = useState(false)
  const [glitch, setGlitch] = useState(false)
  const [dialogue, setDialogue] = useState(null)
  const rafRef = useRef(null)
  const shakeIntensityRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    const wait = (ms) => new Promise(res => setTimeout(res, ms))

    // 화면 흔들림 (rAF 기반)
    const startShake = (intensity) => {
      shakeIntensityRef.current = intensity
      const shake = () => {
        if (cancelled || shakeIntensityRef.current <= 0) {
          setShakeOffset({ x: 0, y: 0 })
          return
        }
        const i = shakeIntensityRef.current
        setShakeOffset({
          x: (Math.random() - 0.5) * i * 2,
          y: (Math.random() - 0.5) * i * 2,
        })
        rafRef.current = requestAnimationFrame(shake)
      }
      rafRef.current = requestAnimationFrame(shake)
    }

    const stopShake = async () => {
      // 강도를 서서히 줄임
      for (let i = 8; i >= 0; i -= 2) {
        if (cancelled) return
        shakeIntensityRef.current = i
        await wait(80)
      }
      shakeIntensityRef.current = 0
      setShakeOffset({ x: 0, y: 0 })
    }

    async function run() {
      // 0.0s: 흔들림 시작 (약하게)
      startShake(3)
      await wait(500)

      // 0.5s: 흔들림 강해짐
      shakeIntensityRef.current = 8
      await wait(300)

      // 0.8s: 글리치
      if (!cancelled) setGlitch(true)
      await wait(200)

      // 1.0s: 백색 플래시
      if (!cancelled) {
        setGlitch(false)
        setFlashOpacity(1)
      }
      await wait(100)

      // 1.1s: 배경 교체 + 플래시 사라짐
      if (!cancelled) {
        setIsOtherworld(true)
        setFlashOpacity(0)
      }
      await wait(200)

      // 1.3s: 흔들림 멈춤
      await stopShake()

      // 1.5s: 주인공 대사
      if (!cancelled) {
        setDialogue({ text: '...어...? 여기가... 어디...?' })
      }

      // 2.5s: 완료
      await wait(1000)
      if (!cancelled) onComplete?.()
    }

    run()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [onComplete])

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
    }}>
      {/* ── 배경 ── */}
      {/* TODO: 배경 이미지 교체 시 filter 대신 별도 이미지 사용 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: isOtherworld
          ? 'linear-gradient(180deg, #1a0a2e 0%, #0d0618 60%, #05030f 100%)'
          : 'linear-gradient(180deg, #F5ECD7 0%, #EAD9BE 60%, #D4BFA0 100%)',
        transition: 'none',
        transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
      }}>
        {/* 이면세계 서가 (플레이스홀더) */}
        {isOtherworld && (
          <div style={{ position: 'absolute', top: 80, left: 20, right: 20 }}>
            {[0, 1, 2].map(row => (
              <div key={row} style={{
                display: 'flex',
                gap: 4,
                marginBottom: 8,
                borderBottom: '2px solid #3a1a5a',
                paddingBottom: 4,
              }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} style={{
                    flex: 1,
                    height: 32,
                    background: DARK_BOOK_COLORS[(row * 10 + i) % DARK_BOOK_COLORS.length],
                    borderRadius: '1px 1px 0 0',
                    opacity: 0.7,
                  }} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 글리치 오버레이 ── */}
      {glitch && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,0,255,0.05)',
          filter: 'hue-rotate(90deg) contrast(1.5)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }} />
      )}

      {/* ── 백색 플래시 ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: '#fff',
        opacity: flashOpacity,
        transition: flashOpacity === 0 ? 'opacity 0.2s' : 'opacity 0.05s',
        pointerEvents: 'none',
      }} />

      {/* ── 주인공 대사 ── */}
      {dialogue && (
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: 16,
          right: 16,
          background: 'rgba(0,0,0,0.75)',
          borderTop: '1px solid #333',
          padding: '12px 14px',
          fontSize: 13,
          color: '#E8E8E8',
        }}>
          {dialogue.text}
        </div>
      )}
    </div>
  )
}

const DARK_BOOK_COLORS = [
  '#2a0a3a', '#1a1a4a', '#0a2a1a', '#3a0a0a', '#0a1a3a',
  '#2a1a0a', '#1a2a0a', '#2a0a2a', '#0a2a2a', '#1a1a1a',
]
