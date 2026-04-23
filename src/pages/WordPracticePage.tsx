import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { QuestionCount } from '../types'
import { useWordQuiz } from '../hooks/useWordQuiz'
import { useStats } from '../hooks/useStats'
import HangulDisplay from '../components/HangulDisplay'
import TextInput from '../components/TextInput'
import ProgressBar from '../components/ProgressBar'
import ResultScreen from '../components/ResultScreen'

const difficultyOptions = [
  { label: 'Easy', value: 1, desc: '1-syllable' },
  { label: 'Medium', value: 2, desc: '2-syllable' },
  { label: 'Hard', value: 3, desc: 'Complex' },
]

const questionCounts: { label: string; value: QuestionCount }[] = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '∞', value: 'infinite' },
]

export default function WordPracticePage() {
  const navigate = useNavigate()
  const { state, start, submitAnswer, finish, restart } = useWordQuiz()
  const { recordWord, recordStreak } = useStats()

  const [selectedDifficulty, setSelectedDifficulty] = useState(2)
  const [selectedCount, setSelectedCount] = useState<QuestionCount>(10)

  useEffect(() => {
    if (state.status === 'active' || state.status === 'reviewing') {
      const q = state.questions[state.currentIndex]
      if (q) recordWord(q.prompt)
    }
  }, [state.status, state.currentIndex, state.questions, recordWord])

  useEffect(() => {
    if (state.bestStreak > 0) recordStreak(state.bestStreak)
  }, [state.bestStreak, recordStreak])

  // Setup screen
  if (state.status === 'setup') {
    return (
      <div className="min-h-screen flex flex-col animate-fade-in">
        <TopBar title="Word Practice" onBack={() => navigate('/')} />

        <div className="flex-1 max-w-xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
          <div>
            <h2 className="font-hand font-bold text-2xl text-ink mb-3">
              Difficulty
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {difficultyOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedDifficulty(opt.value)}
                  className={`py-4 rounded-lg font-hand border-2 transition-all cursor-pointer ${
                    selectedDifficulty === opt.value
                      ? 'border-ink bg-ink text-paper'
                      : 'border-gray-300 bg-paper text-ink hover:border-ink'
                  }`}
                >
                  <div className="font-bold text-xl">{opt.label}</div>
                  <div className="text-sm opacity-75">{opt.desc}</div>
                </button>
              ))}
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
            onClick={() => start(selectedDifficulty, selectedCount)}
            className="mt-4 py-4 rounded-lg bg-k-blue text-paper font-hand font-bold text-2xl border-2 border-ink shadow-[4px_4px_0_#1a1a1a] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1a1a1a] transition-all cursor-pointer"
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

  // Quiz screen
  const question = state.questions[state.currentIndex]
  const isReviewing = state.status === 'reviewing'
  const lastAnswer = isReviewing
    ? state.answers[state.answers.length - 1]
    : null

  const feedback: 'none' | 'correct' | 'incorrect' = !isReviewing
    ? 'none'
    : lastAnswer?.correct
      ? 'correct'
      : 'incorrect'

  return (
    <div className="min-h-screen flex flex-col bg-paper-warm animate-fade-in">
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

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
        <p className="font-hand text-xl text-muted">type the romanization of</p>
        <HangulDisplay
          character={question.prompt}
          subtitle={question.subtitle}
          size="lg"
        />
      </div>

      <div className="max-w-xl w-full mx-auto px-4 pb-6">
        <TextInput
          onSubmit={submitAnswer}
          disabled={isReviewing}
          feedback={feedback}
          hint={state.hint}
        />

        {isReviewing && state.showAnswer && (
          <div className="mt-4 text-center animate-fade-in">
            <p className="font-hand text-lg text-incorrect">
              Answer:{' '}
              <span className="font-bold text-xl">{question.correctAnswer}</span>
            </p>
          </div>
        )}

        {isReviewing && lastAnswer?.correct && (
          <div className="mt-4 text-center animate-fade-in">
            <p className="font-hand text-xl text-correct font-bold">
              ✓ Correct!
            </p>
          </div>
        )}

        {state.questionCount === 'infinite' && !isReviewing && (
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

function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-paper">
      <button
        onClick={onBack}
        className="font-hand text-lg text-muted hover:text-ink transition-colors cursor-pointer"
      >
        ← Back
      </button>
      <div className="font-hand font-bold text-xl text-ink">{title}</div>
      <div className="w-12" />
    </div>
  )
}
