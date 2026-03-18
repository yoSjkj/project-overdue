import { useState, useEffect, useRef } from 'react'

const SPEAKER_LABEL = {
  book: { label: '책', color: '#D4A017' },
  player: { label: '주인공', color: '#E8E8E8' },
}

const TYPING_SPEED = 40   // ms/글자
const DOT_PAUSE = 200     // "..." 각 점 추가 딜레이

/**
 * @param {Object} dialogue - { speaker: 'book'|'player', text: string }
 * @param {number} autoDelay - 타이핑 완료 후 자동 진행까지 대기 ms (0이면 수동 탭)
 * @param {Function} onDone - 진행 완료 콜백
 */
export default function DialogueBox({ dialogue, autoDelay = 0, onDone }) {
  const [displayed, setDisplayed] = useState('')
  const [isTypingDone, setIsTypingDone] = useState(false)
  const timerRef = useRef(null)
  const fullText = dialogue?.text ?? ''
  const speaker = SPEAKER_LABEL[dialogue?.speaker] ?? SPEAKER_LABEL.player

  // 타이핑 효과
  useEffect(() => {
    if (!dialogue) return
    setDisplayed('')
    setIsTypingDone(false)

    let i = 0
    const type = () => {
      if (i >= fullText.length) {
        setIsTypingDone(true)
        return
      }
      const char = fullText[i]
      setDisplayed(fullText.slice(0, i + 1))
      i++
      // "." 이면 추가 딜레이
      const delay = char === '.' || char === '…' ? DOT_PAUSE : TYPING_SPEED
      timerRef.current = setTimeout(type, delay)
    }
    timerRef.current = setTimeout(type, TYPING_SPEED)

    return () => clearTimeout(timerRef.current)
  }, [dialogue])

  // 자동 진행
  useEffect(() => {
    if (!isTypingDone || autoDelay <= 0) return
    const t = setTimeout(() => onDone?.(), autoDelay)
    return () => clearTimeout(t)
  }, [isTypingDone, autoDelay, onDone])

  const handleTap = () => {
    if (!isTypingDone) {
      // 스킵: 전체 텍스트 즉시 표시
      clearTimeout(timerRef.current)
      setDisplayed(fullText)
      setIsTypingDone(true)
    } else if (!autoDelay) {
      // 수동 진행
      onDone?.()
    }
  }

  if (!dialogue) return null

  return (
    <div
      onClick={handleTap}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(0,0,0,0.82)',
        borderTop: '1px solid #2a2a2a',
        padding: '12px 14px',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        minHeight: 72,
        cursor: 'pointer',
        touchAction: 'manipulation',
      }}
    >
      {/* 화자 라벨 */}
      <div style={{
        fontSize: 10,
        color: speaker.color,
        border: `1px solid ${speaker.color}66`,
        padding: '2px 6px',
        borderRadius: 2,
        whiteSpace: 'nowrap',
        marginTop: 2,
        flexShrink: 0,
      }}>
        {speaker.label}
      </div>

      {/* 대사 */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 13,
          color: speaker.color,
          lineHeight: 1.6,
          letterSpacing: 0.3,
        }}>
          {displayed}
          {!isTypingDone && <span style={{ opacity: 0.5 }}>█</span>}
        </div>
        {/* 수동 진행 표시 */}
        {isTypingDone && !autoDelay && (
          <div style={{
            textAlign: 'right',
            fontSize: 10,
            color: '#666',
            marginTop: 4,
            animation: 'blink 1s step-end infinite',
          }}>
            ▼
          </div>
        )}
      </div>
    </div>
  )
}
