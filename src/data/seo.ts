import { lessons } from './lessons'

export const SITE_URL = 'https://practicehangul.com'

export interface PageMeta {
  path: string
  title: string
  description: string
  /** Leave personal pages out of search results */
  noindex?: boolean
}

/** Titles and descriptions for search results and link previews */
export const pages: PageMeta[] = [
  {
    path: '/',
    title: 'Practice Hangul: Learn the Korean Alphabet Free',
    description:
      'Learn to read Hangul, the Korean alphabet, in a day. Free bite-size lessons with memory tricks, letter and word quizzes, daily streaks and saved progress.',
  },
  {
    path: '/learn',
    title: 'Learn Hangul in 10 Free Lessons | Practice Hangul',
    description:
      'Learn all 40 Korean letters in 10 short lessons. Each Hangul letter comes with its sound, a memory trick and quick quizzes until it sticks.',
  },
  ...lessons.map((lesson, i) => ({
    path: `/learn/${lesson.id}`,
    title: `Lesson ${i + 1}: ${lesson.title} (${lesson.letters.join(' ')}) | Learn Hangul`,
    description: `Learn the Korean letters ${lesson.letters.join(', ')} with memory tricks and quick quizzes. ${lesson.idea}`,
  })),
  {
    path: '/letters',
    title: 'Korean Alphabet Quiz: Hangul Letter Practice',
    description:
      'Quiz yourself on Korean consonants and vowels. Pick the right sound for each Hangul letter and build a streak.',
  },
  {
    path: '/words',
    title: 'Read Korean Words: Hangul Reading Practice',
    description:
      'Practice reading real Korean words in Hangul. Type the romanization, get hints, and level up from simple to complex words.',
  },
  {
    path: '/about',
    title: 'What Is Hangul and How Long Does It Take to Learn? | Practice Hangul',
    description:
      'Hangul is the Korean alphabet: 14 basic consonants and 10 basic vowels that stack into syllable blocks. Most people learn to read it in a few hours.',
  },
  {
    path: '/progress',
    title: 'Your Progress | Practice Hangul',
    description: 'Your Hangul streak, accuracy, lessons and letter mastery.',
    noindex: true,
  },
]

export function pageMeta(pathname: string): PageMeta {
  const path = pathname.replace(/\/+$/, '') || '/'
  return pages.find((p) => p.path === path) ?? pages[0]
}
