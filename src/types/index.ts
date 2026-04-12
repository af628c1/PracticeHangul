export type LetterCategory =
  | 'basic-consonant'
  | 'double-consonant'
  | 'basic-vowel'
  | 'compound-vowel'

export interface HangulLetter {
  hangul: string
  romanization: string
  name: string
  category: LetterCategory
}

export interface HangulWord {
  hangul: string
  romanization: string
  english: string
  difficulty: 1 | 2 | 3
}

export type QuestionCount = 10 | 20 | 'infinite'

export interface QuizQuestion {
  prompt: string
  correctAnswer: string
  choices?: string[]
  subtitle?: string
}

export interface QuizState {
  questions: QuizQuestion[]
  currentIndex: number
  score: number
  streak: number
  bestStreak: number
  answers: Array<{ correct: boolean; userAnswer: string }>
  status: 'setup' | 'active' | 'reviewing' | 'finished'
  questionCount: QuestionCount
  totalAnswered: number
}
