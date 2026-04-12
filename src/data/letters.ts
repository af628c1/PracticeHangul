import type { HangulLetter } from '../types'

export const letters: HangulLetter[] = [
  // Basic Consonants (14)
  { hangul: 'ㄱ', romanization: 'g', name: 'giyeok', category: 'basic-consonant' },
  { hangul: 'ㄴ', romanization: 'n', name: 'nieun', category: 'basic-consonant' },
  { hangul: 'ㄷ', romanization: 'd', name: 'digeut', category: 'basic-consonant' },
  { hangul: 'ㄹ', romanization: 'r/l', name: 'rieul', category: 'basic-consonant' },
  { hangul: 'ㅁ', romanization: 'm', name: 'mieum', category: 'basic-consonant' },
  { hangul: 'ㅂ', romanization: 'b', name: 'bieup', category: 'basic-consonant' },
  { hangul: 'ㅅ', romanization: 's', name: 'siot', category: 'basic-consonant' },
  { hangul: 'ㅇ', romanization: 'ng', name: 'ieung', category: 'basic-consonant' },
  { hangul: 'ㅈ', romanization: 'j', name: 'jieut', category: 'basic-consonant' },
  { hangul: 'ㅊ', romanization: 'ch', name: 'chieut', category: 'basic-consonant' },
  { hangul: 'ㅋ', romanization: 'k', name: 'kieuk', category: 'basic-consonant' },
  { hangul: 'ㅌ', romanization: 't', name: 'tieut', category: 'basic-consonant' },
  { hangul: 'ㅍ', romanization: 'p', name: 'pieup', category: 'basic-consonant' },
  { hangul: 'ㅎ', romanization: 'h', name: 'hieut', category: 'basic-consonant' },

  // Double Consonants (5)
  { hangul: 'ㄲ', romanization: 'kk', name: 'ssang-giyeok', category: 'double-consonant' },
  { hangul: 'ㄸ', romanization: 'tt', name: 'ssang-digeut', category: 'double-consonant' },
  { hangul: 'ㅃ', romanization: 'pp', name: 'ssang-bieup', category: 'double-consonant' },
  { hangul: 'ㅆ', romanization: 'ss', name: 'ssang-siot', category: 'double-consonant' },
  { hangul: 'ㅉ', romanization: 'jj', name: 'ssang-jieut', category: 'double-consonant' },

  // Basic Vowels (10)
  { hangul: 'ㅏ', romanization: 'a', name: 'a', category: 'basic-vowel' },
  { hangul: 'ㅑ', romanization: 'ya', name: 'ya', category: 'basic-vowel' },
  { hangul: 'ㅓ', romanization: 'eo', name: 'eo', category: 'basic-vowel' },
  { hangul: 'ㅕ', romanization: 'yeo', name: 'yeo', category: 'basic-vowel' },
  { hangul: 'ㅗ', romanization: 'o', name: 'o', category: 'basic-vowel' },
  { hangul: 'ㅛ', romanization: 'yo', name: 'yo', category: 'basic-vowel' },
  { hangul: 'ㅜ', romanization: 'u', name: 'u', category: 'basic-vowel' },
  { hangul: 'ㅠ', romanization: 'yu', name: 'yu', category: 'basic-vowel' },
  { hangul: 'ㅡ', romanization: 'eu', name: 'eu', category: 'basic-vowel' },
  { hangul: 'ㅣ', romanization: 'i', name: 'i', category: 'basic-vowel' },

  // Compound Vowels (11)
  { hangul: 'ㅐ', romanization: 'ae', name: 'ae', category: 'compound-vowel' },
  { hangul: 'ㅒ', romanization: 'yae', name: 'yae', category: 'compound-vowel' },
  { hangul: 'ㅔ', romanization: 'e', name: 'e', category: 'compound-vowel' },
  { hangul: 'ㅖ', romanization: 'ye', name: 'ye', category: 'compound-vowel' },
  { hangul: 'ㅘ', romanization: 'wa', name: 'wa', category: 'compound-vowel' },
  { hangul: 'ㅙ', romanization: 'wae', name: 'wae', category: 'compound-vowel' },
  { hangul: 'ㅚ', romanization: 'oe', name: 'oe', category: 'compound-vowel' },
  { hangul: 'ㅝ', romanization: 'wo', name: 'wo', category: 'compound-vowel' },
  { hangul: 'ㅞ', romanization: 'we', name: 'we', category: 'compound-vowel' },
  { hangul: 'ㅟ', romanization: 'wi', name: 'wi', category: 'compound-vowel' },
  { hangul: 'ㅢ', romanization: 'ui', name: 'ui', category: 'compound-vowel' },
]

export const categoryLabels: Record<string, string> = {
  'basic-consonant': 'Basic Consonants',
  'double-consonant': 'Double Consonants',
  'basic-vowel': 'Basic Vowels',
  'compound-vowel': 'Compound Vowels',
}
