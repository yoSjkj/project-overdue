import Card from './Card'

export default function Hand({ cards, onCardClick, currentInk, disabled, pulsedCardType }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-end',
      gap: 4,
      padding: '0 8px',
      width: '100%',
      minHeight: 96,
    }}>
      {cards.length === 0 ? (
        <div style={{ color: '#555', fontSize: 12, alignSelf: 'center' }}>
          손패 없음
        </div>
      ) : (
        cards.map((card) => (
          <Card
            key={card.uid}
            card={card}
            onClick={onCardClick}
            disabled={disabled || card.cost > currentInk}
            pulsed={pulsedCardType === card.type}
          />
        ))
      )}
    </div>
  )
}
