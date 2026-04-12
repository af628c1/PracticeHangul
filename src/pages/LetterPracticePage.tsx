import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LetterCategory, QuestionCount } from '../types'
import { categoryLabels } from '../data/letters'
import { useLetterQuiz } from '../hooks/useLetterQuiz'
import HangulDisplay from '../components/HangulDisplay'
import ChoiceButton from '../components/ChoiceButton'
import ProgressBar from '../components/ProgressBar'
import ScoreDisplay from '../components/ScoreDisplay'
import ResultScreen from '../components/ResultScreen'

const allCategories: LetterCategory[] = [
  'basic-consonant',
  'double-consonant',
  'basic-vowel',
  'compound-vowel',
]

const questionCounts: { label: string; value: QuestionCount }[] = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: 'Infinite', value: 'infinite' },
]

export default function LetterPracticePage() {
  const navigate = useNavigate()
  const { state, start, selectAnswer, finish, restart } = useLetterQuiz()

  const [selectedCategories, setSelectedCategories] = useState<LetterCategory[]>([
    'basic-consonant',
    'basic-vowel',
  ])
  const [selectedCount, setSelectedCount] = useState<QuestionCount>(10)

  const toggleCategory = (cat: LetterCategory) => {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) {
        if (prev.length === 1) return prev // Keep at least one
        return prev.filter((c) => c !== cat)
      }
      return [...prev, cat]
    })
  }

  // Setup screen
  if (state.status === 'setup') {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-hangul-text mb-6 text-center">
          Letter Practice
        </h1>

        <div className="bg-hangul-card rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-hangul-text mb-4">
            Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => {
              const active = selectedCategories.includes(cat)
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer border-2 ${
                    active
                      ? 'border-hangul-accent bg-hangul-accent-light text-hangul-accent'
                      : 'border-gray-200 bg-hangul-card text-hangul-muted hover:border-gray-300'
                  }`}
                >
                  {categoryLabels[cat]}
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-hangul-card rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-hangul-text mb-4">
            Questions
          </h2>
          <div className="flex gap-3">
            {questionCounts.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setSelectedCount(opt.value)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer border-2 ${
                  selectedCount === opt.value
                    ? 'border-hangul-accent bg-hangul-accent-light text-hangul-accent'
                    : 'border-gray-200 bg-hangul-card text-hangul-muted hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => start(selectedCategories, selectedCount)}
          className="w-full py-4 rounded-xl bg-hangul-accent text-white text-lg font-semibold hover:bg-hangul-accent/90 transition-colors cursor-pointer"
        >
          Start Practice
        </button>
      </div>
    )
  }

  // Result screen
  if (state.status === 'finished') {
    return (
      <ResultScreen
        score={state.score}
        total={state.totalAnswered}
        bestStreak={state.bestStreak}
        onRestart={restart}
        onHome={() => navigate('/')}
      />
    )
  }

  // Quiz screen
  const question = state.questions[state.currentIndex]
  const currentAnswer =
    state.status === 'reviewing'
      ? state.answers[state.answers.length - 1]
      : null

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-semibold text-hangul-text">
          Letter Practice
        </h1>
        {state.questionCount === 'infinite' && (
          <button
            onClick={finish}
            className="text-sm text-hangul-muted hover:text-hangul-accent transition-colors cursor-pointer"
          >
            Finish
          </button>
        )}
      </div>

      <ProgressBar
        current={
          state.questionCount === 'infinite'
            ? state.totalAnswered
            : state.currentIndex
        }
        total={state.questionCount === 'infinite' ? null : state.questions.length}
      />

      <ScoreDisplay
        score={state.score}
        streak={state.streak}
        totalAnswered={state.totalAnswered}
      />

      <div className="text-center mb-8">
        <HangulDisplay character={question.prompt} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {question.choices!.map((choice) => {
          let buttonState: 'default' | 'correct' | 'incorrect' | 'disabled' =
            'default'
          if (currentAnswer) {
            if (choice === question.correctAnswer) {
              buttonState = 'correct'
            } else if (choice === currentAnswer.userAnswer && !currentAnswer.correct) {
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
    </div>
  )
}
