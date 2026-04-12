import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { QuestionCount } from '../types'
import { useWordQuiz } from '../hooks/useWordQuiz'
import HangulDisplay from '../components/HangulDisplay'
import TextInput from '../components/TextInput'
import ProgressBar from '../components/ProgressBar'
import ScoreDisplay from '../components/ScoreDisplay'
import ResultScreen from '../components/ResultScreen'

const difficultyOptions = [
  { label: 'Easy', value: 1, desc: 'Simple 1-syllable words' },
  { label: 'Medium', value: 2, desc: 'Common 2-syllable words' },
  { label: 'Hard', value: 3, desc: 'Longer, complex words' },
]

const questionCounts: { label: string; value: QuestionCount }[] = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: 'Infinite', value: 'infinite' },
]

export default function WordPracticePage() {
  const navigate = useNavigate()
  const { state, start, submitAnswer, finish, restart } = useWordQuiz()

  const [selectedDifficulty, setSelectedDifficulty] = useState(2)
  const [selectedCount, setSelectedCount] = useState<QuestionCount>(10)

  // Setup screen
  if (state.status === 'setup') {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-hangul-text mb-6 text-center">
          Word Practice
        </h1>

        <div className="bg-hangul-card rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-hangul-text mb-4">
            Difficulty
          </h2>
          <div className="flex gap-3">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedDifficulty(opt.value)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer border-2 ${
                  selectedDifficulty === opt.value
                    ? 'border-hangul-accent bg-hangul-accent-light text-hangul-accent'
                    : 'border-gray-200 bg-hangul-card text-hangul-muted hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">{opt.label}</div>
                <div className="text-xs mt-1 opacity-70">{opt.desc}</div>
              </button>
            ))}
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
          onClick={() => start(selectedDifficulty, selectedCount)}
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
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-semibold text-hangul-text">
          Word Practice
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
        <HangulDisplay character={question.prompt} subtitle={question.subtitle} />
      </div>

      <TextInput
        onSubmit={submitAnswer}
        disabled={isReviewing}
        feedback={feedback}
        hint={state.hint}
      />

      {isReviewing && state.showAnswer && (
        <div className="mt-4 text-center animate-fade-in">
          <p className="text-hangul-incorrect text-sm">
            The answer was:{' '}
            <span className="font-bold text-lg">{question.correctAnswer}</span>
          </p>
        </div>
      )}

      {isReviewing && lastAnswer?.correct && (
        <div className="mt-4 text-center animate-fade-in">
          <p className="text-hangul-correct font-medium">Correct!</p>
        </div>
      )}
    </div>
  )
}
