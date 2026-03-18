import { useGameStore } from '../../stores/gameStore'

export default function TitleScreen() {
  const setScene = useGameStore(s => s.setScene)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 0,
    }}>
      <h1 style={{
        fontSize: 24,
        color: '#D4A017',
        letterSpacing: 6,
        fontWeight: 'normal',
        margin: 0,
      }}>
        금서의 서점
      </h1>

      <div style={{
        width: 40,
        height: 1,
        background: '#5a3a00',
        margin: '20px 0 40px',
      }} />

      <button
        onClick={() => setScene('intro')}
        style={{
          background: 'transparent',
          border: '1px solid #5a3a00',
          color: '#D4A017',
          fontSize: 13,
          padding: '10px 32px',
          cursor: 'pointer',
          letterSpacing: 3,
        }}
      >
        시작하기
      </button>
    </div>
  )
}
