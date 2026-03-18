import { useEffect, useRef, useState } from 'react'

const BAR_WIDTH = 280
const MARKER_SPEED = 220 // px/sec
// 판정 구간 (center = 140) — generous=true 시 거의 전체가 성공 구간
const ZONES = {
  normal:   { PERFECT_HALF: 18, NORMAL_HALF: 52 },
  generous: { PERFECT_HALF: 60, NORMAL_HALF: 130 },
}

function getZoneColor(pos, zones) {
  const dist = Math.abs(pos - BAR_WIDTH / 2)
  if (dist <= zones.PERFECT_HALF) return '#00E676'
  if (dist <= zones.NORMAL_HALF) return '#FFD740'
  return '#FF5252'
}

function judgePosition(pos, zones) {
  const dist = Math.abs(pos - BAR_WIDTH / 2)
  if (dist <= zones.PERFECT_HALF) return 'perfect'
  if (dist <= zones.NORMAL_HALF) return 'normal'
  return 'fail'
}

const RESULT_LABEL = {
  perfect: { text: '완전 해독!', color: '#00E676' },
  normal: { text: '해독', color: '#FFD740' },
  fail: { text: '오역...', color: '#FF5252' },
}

export default function QTEOverlay({ card, onResult, generous = false }) {
  const zones = generous ? ZONES.generous : ZONES.normal
  const [markerPos, setMarkerPos] = useState(0)
  const [result, setResult] = useState(null)
  const posRef = useRef(0)
  const dirRef = useRef(1)
  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)
  const lockedRef = useRef(false)

  useEffect(() => {
    posRef.current = 0
    dirRef.current = 1
    lockedRef.current = false
    setResult(null)

    const animate = (timestamp) => {
      if (lockedRef.current) return
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp
      const dt = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      let pos = posRef.current + dirRef.current * MARKER_SPEED * dt
      if (pos >= BAR_WIDTH) { pos = BAR_WIDTH; dirRef.current = -1 }
      if (pos <= 0) { pos = 0; dirRef.current = 1 }

      posRef.current = pos
      setMarkerPos(pos)
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = null
    }
  }, [card])

  const handleTap = () => {
    if (lockedRef.current) return
    lockedRef.current = true
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const judgment = judgePosition(posRef.current, zones)
    setResult(judgment)

    setTimeout(() => onResult(judgment), 600)
  }

  const zoneColor = getZoneColor(markerPos, zones)

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.82)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        zIndex: 100,
        touchAction: 'manipulation',
      }}
      onClick={handleTap}
    >
      {/* 카드명 */}
      <div style={{ color: '#CCC', fontSize: 13 }}>
        <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{card.name}</span> 해독 중
      </div>

      {/* 타이밍 바 */}
      <div style={{
        position: 'relative',
        width: BAR_WIDTH,
        height: 28,
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        {/* NORMAL 구간 */}
        <div style={{
          position: 'absolute',
          left: BAR_WIDTH / 2 - zones.NORMAL_HALF,
          width: zones.NORMAL_HALF * 2,
          top: 0, height: '100%',
          background: 'rgba(255, 215, 64, 0.25)',
        }} />
        {/* PERFECT 구간 */}
        <div style={{
          position: 'absolute',
          left: BAR_WIDTH / 2 - zones.PERFECT_HALF,
          width: zones.PERFECT_HALF * 2,
          top: 0, height: '100%',
          background: 'rgba(0, 230, 118, 0.35)',
        }} />
        {/* 마커 */}
        <div style={{
          position: 'absolute',
          left: markerPos - 3,
          top: 0,
          width: 6,
          height: '100%',
          background: result ? RESULT_LABEL[result].color : zoneColor,
          borderRadius: 2,
          transition: result ? 'none' : undefined,
          boxShadow: `0 0 8px ${result ? RESULT_LABEL[result].color : zoneColor}`,
        }} />
      </div>

      {/* 결과 표시 */}
      {result ? (
        <div style={{
          fontSize: 22,
          fontWeight: 'bold',
          color: RESULT_LABEL[result].color,
          letterSpacing: 2,
        }}>
          {RESULT_LABEL[result].text}
        </div>
      ) : (
        <div style={{ color: '#888', fontSize: 12 }}>
          탭하여 해독
        </div>
      )}
    </div>
  )
}
