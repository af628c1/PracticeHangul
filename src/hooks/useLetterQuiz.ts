import { useReducer, useCallback, useEffect } from 'react'
import type { QuizState, QuizQuestion, QuestionCount, LetterCategory } from '../types'
import { letters } from '../data/letters'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateQuestions(categories: LetterCategory[]): QuizQuestion[] {
  const pool = letters.filter((l) => categories.includes(l.category))
  const allLetters = letters
  const shuffled = shuffle(pool)

  return shuffled.map((letter) => {
    // Get 3 wrong answers, preferring same-category letters
    const sameCategoryOthers = pool.filter(
      (l) => l.romanization !== letter.romanization
    )
    const allOthers = allLetters.filter(
      (l) => l.romanization !== letter.romanization
    )

    // Use same-category first, fall back to all letters if pool is too small
    const wrongPool =
      sameCategoryOthers.length >= 3 ? sameCategoryOthers : allOthers
    const wrongAnswers = shuffle(wrongPool)
      .slice(0, 3)
      .map((l) => l.romanization)

    const choices = shuffle([letter.romanization, ...wrongAnswers])

    return {
      prompt: letter.hangul,
      correctAnswer: letter.romanization,
      choices,
    }
  })
}

type Action =
  | { type: 'START'; categories: LetterCategory[]; questionCount: QuestionCount }
  | { type: 'SELECT_ANSWER'; answer: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'FINISH' }
  | { type: 'RESTART' }

function getInitialState(): QuizState {
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
  }
}

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'START': {
      const allQuestions = generateQuestions(action.categories)
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
    case 'SELECT_ANSWER': {
      const question = state.questions[state.currentIndex]
      const correct = action.answer === question.correctAnswer
      const newStreak = correct ? state.streak + 1 : 0
      return {
        ...state,
        score: correct ? state.score + 1 : state.score,
        streak: newStreak,
        bestStreak: Math.max(state.bestStreak, newStreak),
        answers: [...state.answers, { correct, userAnswer: action.answer }],
        status: 'reviewing',
        totalAnswered: state.totalAnswered + 1,
      }
    }
    case 'NEXT_QUESTION': {
      const nextIndex = state.currentIndex + 1
      if (nextIndex >= state.questions.length) {
        if (state.questionCount === 'infinite') {
          // Re-shuffle and continue
          const reshuffled = shuffle(state.questions)
          return {
            ...state,
            questions: reshuffled,
            currentIndex: 0,
            status: 'active',
          }
        }
        return { ...state, status: 'finished' }
      }
      return { ...state, currentIndex: nextIndex, status: 'active' }
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

export function useLetterQuiz() {
  const [state, dispatch] = useReducer(reducer, getInitialState())

  const start = useCallback(
    (categories: LetterCategory[], questionCount: QuestionCount) => {
      dispatch({ type: 'START', categories, questionCount })
    },
    []
  )

  const selectAnswer = useCallback((answer: string) => {
    dispatch({ type: 'SELECT_ANSWER', answer })
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

  // Auto-advance after reviewing
  useEffect(() => {
    if (state.status === 'reviewing') {
      const timer = setTimeout(() => {
        nextQuestion()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [state.status, state.currentIndex, nextQuestion])

  return { state, start, selectAnswer, finish, restart }
}
