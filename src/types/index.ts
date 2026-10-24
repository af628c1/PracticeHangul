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
  answers: Array<{ prompt: string; correct: boolean; userAnswer: string }>
  status: 'setup' | 'active' | 'reviewing' | 'finished'
  questionCount: QuestionCount
  totalAnswered: number
}

export type PracticeMode = 'letters' | 'words'

export interface ItemStat {
  seen: number
  correct: number
}

export interface SessionRecord {
  id: string
  mode: PracticeMode
  at: number
  score: number
  total: number
  bestStreak: number
}

export interface PracticePrefs {
  updatedAt: number
  letterCategories: LetterCategory[]
  letterCount: QuestionCount
  wordDifficulty: number
  wordCount: QuestionCount
}

export interface Progress {
  answered: number
  correct: number
  sessions: number
  bestStreak: number
  /** Answers per local day, keyed YYYY-MM-DD */
  activity: Record<string, number>
  /** Keyed by the Hangul prompt */
  letters: Record<string, ItemStat>
  words: Record<string, ItemStat>
  /** Newest first */
  recent: SessionRecord[]
  prefs: PracticePrefs
}

export interface AccountUser {
  uid: string
  name: string | null
  email: string | null
  photoURL: string | null
}
