import type { HangulLetter } from '../types'
import { letters } from '../data/letters'
import { lessons, type Lesson } from '../data/lessons'

const byHangul = new Map(letters.map((l) => [l.hangul, l]))

export function letterInfo(hangul: string): HangulLetter {
  return byHangul.get(hangul)!
}

export function isConsonant(hangul: string): boolean {
  return letterInfo(hangul).category.endsWith('consonant')
}

// ---------- Syllable blocks ----------

const INITIALS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
const MEDIALS = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'

// How each consonant is written at the start of a syllable
const INITIAL_SOUNDS: Record<string, string> = {
  ㄱ: 'g', ㄲ: 'kk', ㄴ: 'n', ㄷ: 'd', ㄸ: 'tt', ㄹ: 'r', ㅁ: 'm', ㅂ: 'b', ㅃ: 'pp',
  ㅅ: 's', ㅆ: 'ss', ㅇ: '', ㅈ: 'j', ㅉ: 'jj', ㅊ: 'ch', ㅋ: 'k', ㅌ: 't', ㅍ: 'p', ㅎ: 'h',
}

/** Builds a consonant + vowel block, e.g. ㄱ + ㅏ = 가 */
export function composeSyllable(consonant: string, vowel: string): string {
  const index = INITIALS.indexOf(consonant) * MEDIALS.length + MEDIALS.indexOf(vowel)
  return String.fromCharCode(0xac00 + index * 28)
}

export function syllableSound(consonant: string, vowel: string): string {
  return INITIAL_SOUNDS[consonant] + letterInfo(vowel).romanization
}

// ---------- Lesson plan ----------

export interface LessonQuestion {
  id: string
  type: 'sound' | 'letter' | 'syllable'
  prompt: string
  answer: string
  choices: string[]
  /** The letter being tested (for stats and hints) */
  letter?: string
  /** For blocks: the consonant and vowel inside */
  parts?: [string, string]
  /** A second try at a question that was missed */
  retry?: boolean
}

export type LessonStep =
  | { kind: 'intro' }
  | { kind: 'teach'; letter: string }
  | { kind: 'blocks' }
  | { kind: 'question'; question: LessonQuestion }
  | { kind: 'done' }

const REVIEW_COUNT = 3
const SYLLABLE_COUNT = 4

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const lessonOf = (hangul: string) => lessons.findIndex((l) => l.letters.includes(hangul))

function letterQuestion(
  id: string,
  type: 'sound' | 'letter',
  letter: string,
  pool: string[],
): LessonQuestion {
  // Letters from the same lesson are the easiest to mix up, so test against them first
  const others = pool.filter((l) => l !== letter)
  const distractors = [
    ...shuffle(others.filter((l) => lessonOf(l) === lessonOf(letter))),
    ...shuffle(others.filter((l) => lessonOf(l) !== lessonOf(letter))),
  ].slice(0, 3)
  const options = shuffle([letter, ...distractors])
  const sound = (l: string) => letterInfo(l).romanization
  return type === 'sound'
    ? { id, type, letter, prompt: letter, answer: sound(letter), choices: options.map(sound) }
    : { id, type, letter, prompt: sound(letter), answer: letter, choices: options }
}

function syllableQuestions(lesson: Lesson, known: string[]): LessonQuestion[] {
  const all = [...known, ...lesson.letters]
  const consonants = all.filter(isConsonant)
  const vowels = all.filter((l) => !isConsonant(l))
  const blocks = consonants.flatMap((c) => vowels.map((v): [string, string] => [c, v]))
  const fresh = blocks.filter(([c, v]) => lesson.letters.includes(c) || lesson.letters.includes(v))

  return shuffle(fresh)
    .slice(0, SYLLABLE_COUNT)
    .map(([c, v], i): LessonQuestion => {
      const answer = syllableSound(c, v)
      // Blocks sharing one letter with the answer make the useful wrong options
      const near = blocks.filter(([c2, v2]) => (c2 === c) !== (v2 === v))
      const far = blocks.filter(([c2, v2]) => c2 !== c && v2 !== v)
      const distractors = [...shuffle(near), ...shuffle(far)]
        .map(([c2, v2]) => syllableSound(c2, v2))
        .filter((s, j, list) => s !== answer && list.indexOf(s) === j)
        .slice(0, 3)
      return {
        id: `block-${i}`,
        type: 'syllable',
        prompt: composeSyllable(c, v),
        answer,
        choices: shuffle([answer, ...distractors]),
        parts: [c, v],
      }
    })
}

/** Avoids asking about the same letter twice in a row */
function spreadOut(questions: LessonQuestion[]): LessonQuestion[] {
  let best = shuffle(questions)
  for (let attempt = 0; attempt < 20; attempt++) {
    if (best.every((q, i) => i === 0 || q.letter !== best[i - 1].letter)) break
    best = shuffle(questions)
  }
  return best
}

/**
 * Introduces each letter with a check right after it, then mixes the new
 * letters (both directions) with a few earlier ones, then reads blocks.
 */
export function buildLessonSteps(lesson: Lesson): LessonStep[] {
  const known = lessons.slice(0, lessons.indexOf(lesson)).flatMap((l) => l.letters)
  const steps: LessonStep[] = [{ kind: 'intro' }]
  const ask = (question: LessonQuestion): LessonStep => ({ kind: 'question', question })

  lesson.letters.forEach((letter, i) => {
    steps.push({ kind: 'teach', letter })
    if (i > 0) {
      const taught = [...lesson.letters.slice(0, i + 1), ...known]
      steps.push(ask(letterQuestion(`check-${i}`, i % 2 ? 'letter' : 'sound', letter, taught)))
    }
  })

  const pool = [...lesson.letters, ...known]
  const practice = [
    ...lesson.letters.map((l, i) => letterQuestion(`sound-${i}`, 'sound', l, pool)),
    ...lesson.letters.map((l, i) => letterQuestion(`letter-${i}`, 'letter', l, pool)),
    ...shuffle(known)
      .slice(0, REVIEW_COUNT)
      .map((l, i) => letterQuestion(`review-${i}`, 'sound', l, pool)),
  ]
  steps.push(...spreadOut(practice).map(ask))

  const blocks = syllableQuestions(lesson, known)
  if (blocks.length > 0) {
    if (lesson.blocks) steps.push({ kind: 'blocks' })
    steps.push(...blocks.map(ask))
  }

  steps.push({ kind: 'done' })
  return steps
}

/** The same question again later in the lesson, with the options reshuffled */
export function retryOf(question: LessonQuestion): LessonQuestion {
  return { ...question, id: `${question.id}-retry`, choices: shuffle(question.choices), retry: true }
}
