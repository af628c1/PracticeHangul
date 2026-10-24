import { useCallback, useEffect, useState } from 'react'

function findKoreanVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null
  return (
    speechSynthesis
      .getVoices()
      .find((v) => v.lang.toLowerCase().replace('_', '-').startsWith('ko')) ?? null
  )
}

/** Reads Korean text aloud, or null when the device has no Korean voice. */
export function useKoreanSpeech() {
  const [voice, setVoice] = useState(findKoreanVoice)

  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return
    // Voices often load after the page does
    const update = () => setVoice(findKoreanVoice())
    speechSynthesis.addEventListener('voiceschanged', update)
    return () => speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!voice) return
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = voice
      utterance.lang = voice.lang
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    },
    [voice],
  )

  return voice ? speak : null
}
