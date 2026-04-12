import { useReducer, useCallback, useEffect } from 'react'
import type { QuizState, QuizQuestion, QuestionCount } from '../types'
import { words } from '../data/words'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateQuestions(maxDifficulty: number): QuizQuestion[] {
  const pool = words.filter((w) => w.difficulty <= maxDifficulty)
  return shuffle(pool).map((word) => ({
    prompt: word.hangul,
    correctAnswer: word.romanization,
    subtitle: word.english,
  }))
}

interface WordQuizState extends QuizState {
  hint: string | null
  attempts: number
  showAnswer: boolean
}

type Action =
  | { type: 'START'; maxDifficulty: number; questionCount: QuestionCount }
  | { type: 'SUBMIT_ANSWER'; answer: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'FINISH' }
  | { type: 'RESTART' }

function getInitialState(): WordQuizState {
  return {
    questions: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    answers: [],
    status: 'setup',
    questionCount: 10,
    totalAnswered: 0,
    hint: null,
    attempts: 0,
    showAnswer: false,
  }
}

function generateHint(answer: string): string {
  return answer[0] + ' ' + '_ '.repeat(answer.length - 1).trim()
}

function reducer(state: WordQuizState, action: Action): WordQuizState {
  switch (action.type) {
    case 'START': {
      const allQuestions = generateQuestions(action.maxDifficulty)
      const count =
        action.questionCount === 'infinite'
          ? allQuestions.length
          : Math.min(action.questionCount, allQuestions.length)
      return {
        ...getInitialState(),
        questions: allQuestions.slice(0, count),
        status: 'active',
        questionCount: action.questionCount,
      }
    }
    case 'SUBMIT_ANSWER': {
      const question = state.questions[state.currentIndex]
      const normalized = action.answer.trim().toLowerCase()
      const correct = normalized === question.correctAnswer.toLowerCase()

      if (correct) {
        const newStreak = state.streak + 1
        return {
          ...state,
          score: state.score + 1,
          streak: newStreak,
          bestStreak: Math.max(state.bestStreak, newStreak),
          answers: [...state.answers, { correct: true, userAnswer: action.answer }],
          status: 'reviewing',
          totalAnswered: state.totalAnswered + 1,
          hint: null,
          attempts: 0,
          showAnswer: false,
        }
      }

      // Wrong answer
      const newAttempts = state.attempts + 1
      if (newAttempts >= 2) {
        // Second wrong answer - show answer and move on
        return {
          ...state,
          streak: 0,
          answers: [
            ...state.answers,
            { correct: false, userAnswer: action.answer },
          ],
          status: 'reviewing',
          totalAnswered: state.totalAnswered + 1,
          hint: null,
          attempts: 0,
          showAnswer: true,
        }
      }

      // First wrong answer - show hint
      return {
        ...state,
        streak: 0,
        attempts: newAttempts,
        hint: generateHint(question.correctAnswer),
      }
    }
    case 'NEXT_QUESTION': {
      const nextIndex = state.currentIndex + 1
      if (nextIndex >= state.questions.length) {
        if (state.questionCount === 'infinite') {
          const reshuffled = shuffle(state.questions)
          return {
            ...state,
            questions: reshuffled,
            currentIndex: 0,
            status: 'active',
            hint: null,
            attempts: 0,
            showAnswer: false,
          }
        }
        return { ...state, status: 'finished' }
      }
      return {
        ...state,
        currentIndex: nextIndex,
        status: 'active',
        hint: null,
        attempts: 0,
        showAnswer: false,
      }
    }
    case 'FINISH': {
      return { ...state, status: 'finished' }
    }
    case 'RESTART': {
      return getInitialState()
    }
    default:
      return state
  }
}

export function useWordQuiz() {
  const [state, dispatch] = useReducer(reducer, getInitialState())

  const start = useCallback(
    (maxDifficulty: number, questionCount: QuestionCount) => {
      dispatch({ type: 'START', maxDifficulty, questionCount })
    },
    []
  )

  const submitAnswer = useCallback((answer: string) => {
    dispatch({ type: 'SUBMIT_ANSWER', answer })
  }, [])

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' })
  }, [])

  const finish = useCallback(() => {
    dispatch({ type: 'FINISH' })
  }, [])

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' })
  }, [])

  // Auto-advance after reviewing (correct or gave up)
  useEffect(() => {
    if (state.status === 'reviewing') {
      const delay = state.showAnswer ? 2000 : 1000
      const timer = setTimeout(() => {
        nextQuestion()
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [state.status, state.currentIndex, state.showAnswer, nextQuestion])

  return { state, start, submitAnswer, finish, restart }
}
