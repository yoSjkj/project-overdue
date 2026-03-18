import { create } from 'zustand'
import cardsData from '../data/cards.json'

const STARTER_IDS = [
  'basic_attack', 'basic_attack', 'basic_attack', 'basic_attack', 'basic_attack',
  'basic_defense', 'basic_defense', 'basic_defense',
  'return_process', 'return_process',
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getCardById(id) {
  return cardsData.find(c => c.id === id)
}

function makeCard(id, uid) {
  return { ...getCardById(id), uid }
}

export const useDeckStore = create((set, get) => ({
  deck: [],
  hand: [],
  discard: [],
  exhaust: [],

  // 일반 시작 덱 (10장)
  initDeck: () => {
    const cards = STARTER_IDS.map((id, i) => makeCard(id, `${id}_${i}`))
    set({ deck: shuffle(cards), hand: [], discard: [], exhaust: [] })
  },

  // 튜토리얼 덱 (3장, 처음부터 손패에)
  initTutorialDeck: () => {
    const cards = [
      makeCard('basic_attack', 'tut_atk_1'),
      makeCard('basic_attack', 'tut_atk_2'),
      makeCard('basic_defense', 'tut_def_1'),
    ]
    set({ deck: [], hand: cards, discard: [], exhaust: [] })
  },

  drawCards: (count = 5) => {
    set((state) => {
      let deck = [...state.deck]
      let discard = [...state.discard]
      const hand = [...state.hand]

      for (let i = 0; i < count; i++) {
        if (deck.length === 0) {
          if (discard.length === 0) break
          deck = shuffle(discard)
          discard = []
        }
        hand.push(deck.pop())
      }
      return { deck, discard, hand }
    })
  },

  discardHand: () => set((state) => ({
    discard: [...state.discard, ...state.hand],
    hand: [],
  })),

  playCard: (uid) => set((state) => {
    const card = state.hand.find(c => c.uid === uid)
    if (!card) return state
    return {
      hand: state.hand.filter(c => c.uid !== uid),
      discard: [...state.discard, card],
    }
  }),

  exhaustCard: (uid) => set((state) => {
    const card = state.hand.find(c => c.uid === uid)
    if (!card) return state
    return {
      hand: state.hand.filter(c => c.uid !== uid),
      exhaust: [...state.exhaust, card],
    }
  }),

  addCardToDeck: (cardId) => {
    const base = getCardById(cardId)
    if (!base) return
    set((state) => ({
      discard: [...state.discard, { ...base, uid: `${cardId}_${Date.now()}` }],
    }))
  },

  removeCardPermanently: (uid) => set((state) => ({
    deck: state.deck.filter(c => c.uid !== uid),
    discard: state.discard.filter(c => c.uid !== uid),
  })),
}))
