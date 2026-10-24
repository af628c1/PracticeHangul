import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LetterCategory, QuestionCount } from '../types'
import { allCategories, categoryLabels } from '../data/letters'
import { useLetterQuiz } from '../hooks/useLetterQuiz'
import { useProgress } from '../hooks/useProgress'
import HangulDisplay from '../components/HangulDisplay'
import ChoiceButton from '../components/ChoiceButton'
import ProgressBar from '../components/ProgressBar'
import ResultScreen from '../components/ResultScreen'
import TopBar from '../components/TopBar'

const questionCounts: { label: string; value: QuestionCount }[] = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '∞', value: 'infinite' },
]

export default function LetterPracticePage() {
  const navigate = useNavigate()
  const { state, start, selectAnswer, finish, restart } = useLetterQuiz()
  const { progress, recordAnswer, recordStreak, recordSession, savePrefs } =
    useProgress()

  const [selectedCategories, setSelectedCategories] = useState<LetterCategory[]>(
    () => progress.prefs.letterCategories,
  )
  const [selectedCount, setSelectedCount] = useState<QuestionCount>(
    () => progress.prefs.letterCount,
  )

  const toggleCategory = (cat: LetterCategory) => {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) {
        if (prev.length === 1) return prev
        return prev.filter((c) => c !== cat)
      }
      return [...prev, cat]
    })
  }

  // Track progress
  const latestAnswer = state.answers.at(-1)
  useEffect(() => {
    if (latestAnswer) {
      recordAnswer('letters', latestAnswer.prompt, latestAnswer.correct)
    }
  }, [latestAnswer, recordAnswer])

  useEffect(() => {
    if (state.bestStreak > 0) recordStreak(state.bestStreak)
  }, [state.bestStreak, recordStreak])

  const finished = state.status === 'finished'
  useEffect(() => {
    if (finished && state.totalAnswered > 0) {
      recordSession('letters', {
        score: state.score,
        total: state.totalAnswered,
        bestStreak: state.bestStreak,
      })
    }
  }, [finished, state.score, state.totalAnswered, state.bestStreak, recordSession])

  const handleStart = () => {
    savePrefs({ letterCategories: selectedCategories, letterCount: selectedCount })
    start(selectedCategories, selectedCount)
  }

  // Setup screen
  if (state.status === 'setup') {
    return (
      <div className="min-h-screen flex flex-col animate-fade-in">
        <TopBar title="Letter Practice" onBack={() => navigate('/')} />

        <div className="flex-1 max-w-xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
          <div>
            <h2 className="font-hand font-bold text-2xl text-ink mb-3">
              Categories
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {allCategories.map((cat) => {
                const active = selectedCategories.includes(cat)
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`py-3 px-4 rounded-lg text-left font-hand text-base border-2 transition-all cursor-pointer ${
                      active
                        ? 'border-ink bg-ink text-paper'
                        : 'border-gray-300 bg-paper text-ink hover:border-ink'
                    }`}
                  >
                    {categoryLabels[cat]}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="font-hand font-bold text-2xl text-ink mb-3">
              Questions
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {questionCounts.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setSelectedCount(opt.value)}
                  className={`py-3 rounded-lg font-hand font-bold text-2xl border-2 transition-all cursor-pointer ${
                    selectedCount === opt.value
                      ? 'border-ink bg-ink text-paper'
                      : 'border-gray-300 bg-paper text-ink hover:border-ink'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="mt-4 py-4 rounded-lg bg-k-red text-paper font-hand font-bold text-2xl border-2 border-ink shadow-[4px_4px_0_#1a1a1a] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1a1a1a] transition-all cursor-pointer"
          >
            Start Practice →
          </button>
        </div>
      </div>
    )
  }

  // Result screen
  if (state.status === 'finished') {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar title="" onBack={() => navigate('/')} />
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <ResultScreen
            score={state.score}
            total={state.totalAnswered}
            bestStreak={state.bestStreak}
            onRestart={restart}
            onHome={() => navigate('/')}
          />
        </div>
      </div>
    )
  }

  // Quiz screen - V3 immersive
  const question = state.questions[state.currentIndex]
  const currentAnswer =
    state.status === 'reviewing'
      ? state.answers[state.answers.length - 1]
      : null

  return (
    <div className="min-h-screen flex flex-col bg-paper-warm animate-fade-in">
      {/* Top status bar: close | progress | counter */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={restart}
          className="font-hand text-xl text-muted-soft hover:text-ink transition-colors cursor-pointer w-6 text-center"
          aria-label="Close"
        >
          ✕
        </button>
        <ProgressBar
          current={
            state.questionCount === 'infinite'
              ? state.totalAnswered
              : state.currentIndex
          }
          total={
            state.questionCount === 'infinite' ? null : state.questions.length
          }
        />
        <span className="font-hand text-lg text-muted-soft min-w-[3rem] text-right">
          {state.questionCount === 'infinite'
            ? `${state.totalAnswered}`
            : `${state.currentIndex + 1}/${state.questions.length}`}
        </span>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
        <p className="font-hand text-xl text-muted">
          which romanization is this?
        </p>
        <HangulDisplay character={question.prompt} />
        {state.streak >= 3 && state.status === 'active' && (
          <div className="font-hand text-lg text-k-red flex items-center gap-1 animate-fade-in">
            <span>🔥</span>
            <span className="font-bold">{state.streak}</span>
            <span className="text-muted">streak</span>
          </div>
        )}
      </div>

      {/* Answer options */}
      <div className="max-w-2xl w-full mx-auto px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {question.choices!.map((choice) => {
            let buttonState: 'default' | 'correct' | 'incorrect' | 'disabled' =
              'default'
            if (currentAnswer) {
              if (choice === question.correctAnswer) {
                buttonState = 'correct'
              } else if (
                choice === currentAnswer.userAnswer &&
                !currentAnswer.correct
              ) {
                buttonState = 'incorrect'
              } else {
                buttonState = 'disabled'
              }
            }

            return (
              <ChoiceButton
                key={choice}
                label={choice}
                state={buttonState}
                onClick={() => selectAnswer(choice)}
              />
            )
          })}
        </div>

        {state.questionCount === 'infinite' && (
          <button
            onClick={finish}
            className="mt-4 mx-auto block font-hand text-lg text-muted hover:text-ink transition-colors cursor-pointer"
          >
            finish practice →
          </button>
        )}
      </div>
    </div>
  )
}
