import { Fragment, useEffect, useReducer, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { lessons, letterGuides, type Lesson } from '../data/lessons'
import { useKoreanSpeech } from '../hooks/useKoreanSpeech'
import { useProgress } from '../hooks/useProgress'
import {
  buildLessonSteps,
  composeSyllable,
  isConsonant,
  letterInfo,
  retryOf,
  syllableSound,
  type LessonQuestion,
  type LessonStep,
} from '../lib/lessons'
import ChoiceButton from '../components/ChoiceButton'
import HangulDisplay from '../components/HangulDisplay'
import ProgressBar from '../components/ProgressBar'

export default function LessonPage() {
  const { lessonId } = useParams()
  const lesson = lessons.find((l) => l.id === lessonId)
  if (!lesson) return <Navigate to="/learn" replace />
  // A fresh player per lesson, so "Next lesson" starts clean
  return <LessonPlayer key={lesson.id} lesson={lesson} />
}

interface PlayerState {
  steps: LessonStep[]
  position: number
  picked: string | null
  /** Questions answered right on the first try */
  firstTry: number
  /** Questions asked, not counting retries */
  asked: number
  streak: number
  bestStreak: number
}

type Action =
  | { type: 'NEXT' }
  | { type: 'ANSWER'; choice: string; correct: boolean; retry: LessonQuestion | null }

// Missed questions come back a few steps later
const RETRY_GAP = 4
const AUTO_ADVANCE_MS = 900

function startLesson(lesson: Lesson): PlayerState {
  return {
    steps: buildLessonSteps(lesson),
    position: 0,
    picked: null,
    firstTry: 0,
    asked: 0,
    streak: 0,
    bestStreak: 0,
  }
}

function reducer(state: PlayerState, action: Action): PlayerState {
  switch (action.type) {
    case 'NEXT':
      return {
        ...state,
        position: Math.min(state.position + 1, state.steps.length - 1),
        picked: null,
      }
    case 'ANSWER': {
      if (state.picked !== null) return state
      const step = state.steps[state.position]
      const isRetry = step.kind === 'question' && Boolean(step.question.retry)
      const streak = action.correct ? state.streak + 1 : 0
      const steps = [...state.steps]
      if (action.retry) {
        // Always before the final "done" step
        const at = Math.min(state.position + RETRY_GAP, steps.length - 1)
        steps.splice(at, 0, { kind: 'question', question: action.retry })
      }
      return {
        ...state,
        steps,
        picked: action.choice,
        firstTry: state.firstTry + (action.correct && !isRetry ? 1 : 0),
        asked: state.asked + (isRetry ? 0 : 1),
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
      }
    }
    default:
      return state
  }
}

function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const { recordAnswer, recordStreak, completeLesson } = useProgress()
  const speak = useKoreanSpeech()
  const [state, dispatch] = useReducer(reducer, lesson, startLesson)
  const step = state.steps[state.position]
  const next = () => dispatch({ type: 'NEXT' })

  // Right answers move on by themselves; wrong ones wait so the hint can be read
  const answeredRight = step.kind === 'question' && state.picked === step.question.answer
  useEffect(() => {
    if (!answeredRight) return
    const timer = setTimeout(() => dispatch({ type: 'NEXT' }), AUTO_ADVANCE_MS)
    return () => clearTimeout(timer)
  }, [answeredRight, state.position])

  const finished = step.kind === 'done'
  useEffect(() => {
    if (finished) {
      completeLesson(lesson.id, {
        score: state.firstTry,
        total: state.asked,
        bestStreak: state.bestStreak,
      })
    }
  }, [finished, lesson.id, state.firstTry, state.asked, state.bestStreak, completeLesson])

  const answer = (question: LessonQuestion, choice: string) => {
    if (state.picked !== null) return
    const correct = choice === question.answer
    if (question.letter) recordAnswer('letters', question.letter, correct)
    if (correct) recordStreak(state.streak + 1)
    dispatch({
      type: 'ANSWER',
      choice,
      correct,
      retry: correct || question.retry ? null : retryOf(question),
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper-warm">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link
          to="/learn"
          aria-label="Close lesson"
          className="font-hand text-xl text-muted-soft hover:text-ink transition-colors w-6 text-center no-underline"
        >
          ✕
        </Link>
        <ProgressBar current={state.position} total={state.steps.length - 1} />
      </div>

      <div
        key={state.position}
        className="flex-1 flex flex-col max-w-xl w-full mx-auto px-6 pb-8 animate-fade-in"
      >
        {step.kind === 'intro' && <Intro lesson={lesson} onNext={next} />}
        {step.kind === 'teach' && <Teach letter={step.letter} speak={speak} onNext={next} />}
        {step.kind === 'blocks' && <Blocks lesson={lesson} onNext={next} />}
        {step.kind === 'question' && (
          <Question
            question={step.question}
            picked={state.picked}
            onAnswer={(choice) => answer(step.question, choice)}
            onNext={next}
          />
        )}
        {step.kind === 'done' && (
          <Done lesson={lesson} score={state.firstTry} total={state.asked} />
        )}
      </div>
    </div>
  )
}

function Intro({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-6">
        <div className="font-hand text-xl text-muted">
          lesson {lessons.indexOf(lesson) + 1} of {lessons.length}
        </div>
        <h1 className="font-hand font-bold text-4xl sm:text-5xl text-ink leading-tight">
          {lesson.title}
        </h1>
        <div
          lang="ko"
          className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-6xl font-bold text-ink"
        >
          {lesson.letters.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <Note label="the big idea">
          <Prose text={lesson.idea} />
        </Note>
      </div>
      <button
        autoFocus
        onClick={onNext}
        className="py-4 rounded-lg bg-k-red text-paper font-hand font-bold text-2xl border-2 border-ink shadow-[4px_4px_0_#1a1a1a] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1a1a1a] transition-all cursor-pointer"
      >
        Start lesson →
      </button>
    </>
  )
}

function Teach({
  letter,
  speak,
  onNext,
}: {
  letter: string
  speak: ((text: string) => void) | null
  onNext: () => void
}) {
  const guide = letterGuides[letter]
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-6">
        <div className="font-hand text-xl text-muted">new letter</div>
        <HangulDisplay character={letter} />
        <div className="font-hand font-bold text-5xl text-k-red mt-2">
          {letterInfo(letter).romanization}
        </div>
        <div className="font-hand text-xl text-muted leading-snug">{guide.sound}</div>
        {isConsonant(letter) && (
          <div className="font-hand text-xl text-muted">
            in a block:{' '}
            <span lang="ko" className="font-sans font-bold text-ink">
              {guide.example}
            </span>{' '}
            = {syllableSound(letter, 'ㅏ')}
          </div>
        )}
        {speak && (
          <button
            onClick={() => speak(guide.example)}
            className="mt-1 px-4 py-1 rounded-full border-2 border-ink font-hand text-lg text-ink hover:bg-ink hover:text-paper transition-colors cursor-pointer"
          >
            🔊 hear it
          </button>
        )}
        <Note label="memory trick">
          <Prose text={guide.tip} />
        </Note>
      </div>
      <PrimaryButton onClick={onNext}>Got it →</PrimaryButton>
    </>
  )
}

function Blocks({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  const consonant = lesson.letters.find(isConsonant) ?? 'ㅇ'
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-6">
        <div className="font-hand text-xl text-muted">reading blocks</div>
        <div lang="ko" className="flex flex-col gap-3 text-5xl font-bold text-ink">
          {['ㅏ', 'ㅗ'].map((vowel) => (
            <div key={vowel} className="flex items-center justify-center gap-3">
              <span>{consonant}</span>
              <span className="font-hand font-normal text-3xl text-muted">+</span>
              <span>{vowel}</span>
              <span className="font-hand font-normal text-3xl text-muted">=</span>
              <span className="text-k-red">{composeSyllable(consonant, vowel)}</span>
            </div>
          ))}
        </div>
        <Note label="how blocks work">
          <Prose text={lesson.blocks ?? ''} />
        </Note>
      </div>
      <PrimaryButton onClick={onNext}>Let’s read →</PrimaryButton>
    </>
  )
}

const questionPrompts: Record<LessonQuestion['type'], string> = {
  sound: 'what sound does this make?',
  letter: 'which letter makes this sound?',
  syllable: 'read this block',
}

function Question({
  question,
  picked,
  onAnswer,
  onNext,
}: {
  question: LessonQuestion
  picked: string | null
  onAnswer: (choice: string) => void
  onNext: () => void
}) {
  const answered = picked !== null
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-6">
        <p className="font-hand text-xl text-muted">{questionPrompts[question.type]}</p>
        {question.type === 'letter' ? (
          <div className="font-hand font-bold text-7xl text-ink">“{question.prompt}”</div>
        ) : (
          <HangulDisplay character={question.prompt} />
        )}
        {question.retry && !answered && (
          <p className="font-hand text-lg text-k-red">let’s try this one again</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {question.choices.map((choice) => (
          <ChoiceButton
            key={choice}
            label={choice}
            state={
              !answered
                ? 'default'
                : choice === question.answer
                  ? 'correct'
                  : choice === picked
                    ? 'incorrect'
                    : 'disabled'
            }
            onClick={() => onAnswer(choice)}
          />
        ))}
      </div>

      {answered && picked !== question.answer && (
        <div className="mt-5 flex flex-col gap-3 animate-fade-in">
          <Note label="remember">
            <Explanation question={question} />
          </Note>
          <PrimaryButton onClick={onNext}>Continue →</PrimaryButton>
        </div>
      )}
    </>
  )
}

function Explanation({ question }: { question: LessonQuestion }) {
  if (question.parts) {
    const [consonant, vowel] = question.parts
    return <Prose text={`${consonant} + ${vowel} = ${question.prompt} “${question.answer}”`} />
  }
  const letter = question.letter!
  return (
    <>
      <span lang="ko">{letter}</span> is “{letterInfo(letter).romanization}”.{' '}
      <Prose text={letterGuides[letter].tip} />
    </>
  )
}

function Done({ lesson, score, total }: { lesson: Lesson; score: number; total: number }) {
  const nextLesson = lessons[lessons.indexOf(lesson) + 1]
  const percent = total > 0 ? Math.round((score / total) * 100) : 100
  return (
    <div className="flex-1 flex items-center justify-center py-6">
      <div className="w-full max-w-md text-center bg-paper rounded-lg border-2 border-ink p-8 shadow-[4px_4px_0_#1a1a1a] animate-slide-up">
        <div className="text-6xl mb-4">{!nextLesson ? '🎉' : percent >= 80 ? '🌟' : '👍'}</div>
        <h2 className="font-hand font-bold text-3xl text-ink mb-1">
          {nextLesson ? 'Lesson complete!' : 'You can read every letter!'}
        </h2>
        <p className="font-hand text-xl text-muted">
          {score} of {total} right on the first try
        </p>
        <div lang="ko" className="text-4xl font-bold text-ink tracking-widest my-5">
          {lesson.letters.join(' ')}
        </div>
        <div className="flex gap-3">
          <Link
            to={nextLesson ? `/learn/${nextLesson.id}` : '/letters'}
            className="flex-1 py-3 rounded-lg bg-ink text-paper font-hand font-bold text-xl border-2 border-ink hover:bg-ink-soft transition-colors no-underline"
          >
            {nextLesson ? 'Next lesson →' : 'Practice →'}
          </Link>
          <Link
            to="/learn"
            className="flex-1 py-3 rounded-lg bg-paper text-ink font-hand font-bold text-xl border-2 border-ink hover:bg-gray-50 transition-colors no-underline"
          >
            All lessons
          </Link>
        </div>
      </div>
    </div>
  )
}

function Note({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="w-full mt-2 bg-paper border-2 border-ink rounded-lg px-5 py-4 text-left">
      <div className="font-hand text-base text-muted">{label}</div>
      <div className="font-hand text-2xl text-ink leading-snug">{children}</div>
    </div>
  )
}

/**
 * Renders *starred* words in the accent colour, and keeps little formulas
 * like "ㅇ + ㅏ = 아" from breaking across lines.
 */
function Prose({ text }: { text: string }) {
  const unbroken = text.replace(/ ([+=→]) /g, '\u00a0$1\u00a0')
  return unbroken.split('*').map((part, i) =>
    i % 2 ? (
      <strong key={i} className="font-bold text-k-red">
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      autoFocus
      onClick={onClick}
      className="w-full py-3 rounded-lg bg-ink text-paper font-hand font-bold text-xl border-2 border-ink hover:bg-ink-soft transition-colors cursor-pointer"
    >
      {children}
    </button>
  )
}
