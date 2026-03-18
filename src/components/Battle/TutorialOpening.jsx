import { useState } from 'react'
import DialogueBox from '../common/DialogueBox'

const DIALOGUES = [
  { speaker: 'book',   text: '안녕하세요. 저는 안내서입니다. 열람해주셔서 감사합니다.', autoDelay: 1200 },
  { speaker: 'player', text: '...책이 말을 한다고...?', autoDelay: 1000 },
  { speaker: 'book',   text: '네, 물론이죠. 책이 말을 안 하면 누가 하나요?', autoDelay: 1000 },
  { speaker: 'book',   text: '앞에 연체자가 있네요. 제 페이지를 사용하시면 처리할 수 있습니다.', autoDelay: 0 },
]

/**
 * 첫 전투 진입 시 자동 진행되는 대화 시퀀스 (블로킹 오버레이)
 * onComplete() 호출 시 손패 보여주며 전투 시작
 */
export default function TutorialOpening({ onComplete }) {
  const [idx, setIdx] = useState(0)

  const handleDone = () => {
    if (idx < DIALOGUES.length - 1) {
      setIdx(idx + 1)
    } else {
      onComplete()
    }
  }

  return (
    // 반투명 오버레이: 배경 전투 화면이 보이지만 입력은 막힘
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 50,
      // 대화창 영역만 가림, 나머지는 투명
      pointerEvents: 'all',
    }}>
      <DialogueBox
        key={idx}
        dialogue={DIALOGUES[idx]}
        autoDelay={DIALOGUES[idx].autoDelay}
        onDone={handleDone}
      />
    </div>
  )
}
