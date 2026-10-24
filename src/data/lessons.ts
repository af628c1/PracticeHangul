export interface Lesson {
  id: string
  title: string
  /** Taught in this order */
  letters: string[]
  /** The big idea, shown before the lesson starts */
  idea: string
  /** Explains syllable blocks before the first block questions */
  blocks?: string
}

/**
 * Small groups ordered so learners read real syllables early: simple vowels,
 * then consonants, then the letters built from them by adding strokes.
 */
export const lessons: Lesson[] = [
  {
    id: 'first-vowels',
    title: 'First vowels',
    letters: ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ'],
    idea: 'Vowels are a long line plus a short stroke. Which way the stroke points tells you the sound.',
  },
  {
    id: 'lines-and-circle',
    title: 'Lines & the silent circle',
    letters: ['ㅡ', 'ㅣ', 'ㅇ'],
    idea: 'Two plain lines and a circle. Learn these and you can read your first syllables.',
    blocks:
      'Every syllable block starts with a consonant. ㅇ is silent there, so ㅇ + ㅏ = 아 just says “a”.',
  },
  {
    id: 'first-consonants',
    title: 'First consonants',
    letters: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'],
    idea: 'The consonants were drawn from your mouth: ㄱ is the back of your tongue lifting, ㄴ is the tip touching behind your teeth.',
    blocks:
      'Consonant first, then vowel, in one block: ㄱ + ㅏ = 가 “ga”. Tall vowels sit to the right (가), flat vowels sit underneath (고).',
  },
  {
    id: 'lips-and-teeth',
    title: 'Lips & teeth',
    letters: ['ㅁ', 'ㅂ', 'ㅅ', 'ㅈ'],
    idea: 'ㅁ is drawn like closed lips and ㅅ like a tooth. ㅂ and ㅈ are their cousins with extra strokes.',
  },
  {
    id: 'y-vowels',
    title: 'Y vowels',
    letters: ['ㅑ', 'ㅕ', 'ㅛ', 'ㅠ'],
    idea: 'Double the short stroke and you add a “y”: ㅏ a becomes ㅑ ya.',
  },
  {
    id: 'puff-of-air',
    title: 'A puff of air',
    letters: ['ㅋ', 'ㅌ', 'ㅍ', 'ㅊ', 'ㅎ'],
    idea: 'An extra stroke adds a puff of air: ㄱ g → ㅋ k, ㄷ d → ㅌ t, ㅈ j → ㅊ ch. Hold a hand in front of your mouth to feel it.',
  },
  {
    id: 'double-consonants',
    title: 'Double consonants',
    letters: ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'],
    idea: 'Doubling a letter makes it tense: say it tight and sharp, with no puff of air.',
  },
  {
    id: 'e-sounds',
    title: 'E sounds',
    letters: ['ㅐ', 'ㅔ', 'ㅒ', 'ㅖ'],
    idea: 'Add ㅣ to ㅏ or ㅓ and you get “e” sounds. ㅐ and ㅔ sound almost the same today.',
  },
  {
    id: 'w-sounds',
    title: 'W sounds',
    letters: ['ㅘ', 'ㅝ', 'ㅙ', 'ㅞ'],
    idea: 'Squash two vowels into one and say them fast: ㅗ + ㅏ = ㅘ “wa”. A ㅗ or ㅜ in front adds a “w”.',
  },
  {
    id: 'final-three',
    title: 'The final three',
    letters: ['ㅚ', 'ㅟ', 'ㅢ'],
    idea: 'Add ㅣ to ㅗ, ㅜ or ㅡ. After these three you can read every Hangul letter!',
  },
]

export interface LetterGuide {
  /** How it sounds, in English terms */
  sound: string
  /** Memory trick; *stars* mark the words to emphasise */
  tip: string
  /** A syllable that shows the sound (read aloud, and shown for consonants) */
  example: string
}

export const letterGuides: Record<string, LetterGuide> = {
  // Simple vowels
  ㅏ: {
    sound: '“ah”, as in father',
    tip: 'The short stroke points *right*, out and open: say “ah”.',
    example: '아',
  },
  ㅓ: {
    sound: '“uh”, as in up',
    tip: 'The short stroke points *left*, back at the line, like a puzzled “uh?”',
    example: '어',
  },
  ㅗ: {
    sound: '“oh”, as in go',
    tip: 'The short stroke sits *over* the line: o for over.',
    example: '오',
  },
  ㅜ: {
    sound: '“oo”, as in moon',
    tip: 'The short stroke hangs *under* the line: u for under.',
    example: '우',
  },
  ㅡ: {
    sound: '“oo” with your lips spread flat',
    tip: 'A *flat* line for flat lips: smile tight and say “eu”.',
    example: '으',
  },
  ㅣ: {
    sound: '“ee”, as in see',
    tip: 'A standing line, like an *i* without its dot: “ee”.',
    example: '이',
  },

  // Y vowels
  ㅑ: {
    sound: '“ya”, as in yacht',
    tip: 'ㅏ with a *second stroke*. An extra stroke adds a y: a → ya.',
    example: '야',
  },
  ㅕ: {
    sound: '“yuh”, as in young',
    tip: 'ㅓ with a *second stroke*: eo → yeo.',
    example: '여',
  },
  ㅛ: {
    sound: '“yo”, as in yoga',
    tip: 'ㅗ with a *second stroke*: o → yo.',
    example: '요',
  },
  ㅠ: {
    sound: '“you”',
    tip: 'ㅜ with a *second stroke*: u → yu.',
    example: '유',
  },

  // Vowel combinations
  ㅐ: {
    sound: '“e”, as in bed',
    tip: '*ㅏ + ㅣ* squeezed together: a + i → ae.',
    example: '애',
  },
  ㅔ: {
    sound: '“e”, as in bed',
    tip: '*ㅓ + ㅣ*. Sounds just like ㅐ; Koreans mostly tell them apart by spelling.',
    example: '에',
  },
  ㅒ: {
    sound: '“ye”, as in yes',
    tip: '*ㅑ + ㅣ*: the y version of ㅐ.',
    example: '얘',
  },
  ㅖ: {
    sound: '“ye”, as in yes',
    tip: '*ㅕ + ㅣ*: the y version of ㅔ.',
    example: '예',
  },
  ㅘ: {
    sound: '“wa”, as in want',
    tip: '*ㅗ + ㅏ*: say o + a fast and it slides into wa.',
    example: '와',
  },
  ㅝ: {
    sound: '“wuh”, as in won',
    tip: '*ㅜ + ㅓ*: u + eo said fast → wo.',
    example: '워',
  },
  ㅙ: {
    sound: '“we”, as in wet',
    tip: '*ㅗ + ㅐ*: o + ae → wae.',
    example: '왜',
  },
  ㅞ: {
    sound: '“we”, as in wet',
    tip: '*ㅜ + ㅔ*: u + e → we. Sounds the same as ㅙ.',
    example: '웨',
  },
  ㅚ: {
    sound: '“we”, as in wet',
    tip: '*ㅗ + ㅣ*. Spelled oe, but said “we” today.',
    example: '외',
  },
  ㅟ: {
    sound: '“wee”, as in week',
    tip: '*ㅜ + ㅣ*: u + i → wi.',
    example: '위',
  },
  ㅢ: {
    sound: '“eu” sliding into “ee”',
    tip: '*ㅡ + ㅣ*: flat-lipped eu, then ee, in one breath.',
    example: '의',
  },

  // Basic consonants
  ㄱ: {
    sound: '“g”, as in go',
    tip: 'Looks like a *gun*: g for gun.',
    example: '가',
  },
  ㄴ: {
    sound: '“n”, as in no',
    tip: 'Looks like a *nose* from the side: n for nose.',
    example: '나',
  },
  ㄷ: {
    sound: '“d”, as in do',
    tip: 'ㄴ with a *lid* on top: same tongue spot, but a d.',
    example: '다',
  },
  ㄹ: {
    sound: 'a light “r” (like the tt in butter), or “l” at the end of a block',
    tip: 'Zig-zags like a *rattlesnake*: r for rattlesnake.',
    example: '라',
  },
  ㅁ: {
    sound: '“m”, as in mom',
    tip: 'A box like a folded *map*, or closed lips humming “mmm”.',
    example: '마',
  },
  ㅂ: {
    sound: '“b”, as in boy',
    tip: 'Looks like a *bucket*: b for bucket.',
    example: '바',
  },
  ㅅ: {
    sound: '“s”, as in sun (“sh” before ㅣ)',
    tip: 'Looks like a mountain *summit*: s for summit.',
    example: '사',
  },
  ㅇ: {
    sound: 'silent at the start of a block, “ng” at the end',
    tip: 'A circle, like a *zero*: silent at the start. At the bottom of a block it rings: “ng” as in ring.',
    example: '아',
  },
  ㅈ: {
    sound: '“j”, as in jam',
    tip: 'A stick figure doing a *jumping jack*: j.',
    example: '자',
  },
  ㅊ: {
    sound: '“ch”, as in church',
    tip: 'ㅈ with a *steeple* on top, like a church: ch.',
    example: '차',
  },
  ㅋ: {
    sound: '“k”, as in kite',
    tip: 'ㄱ plus an *extra stroke* for a puff of air: g → k. (ㅋㅋㅋ is Korean for “lol”.)',
    example: '카',
  },
  ㅌ: {
    sound: '“t”, as in top',
    tip: 'ㄷ plus an *extra stroke*: d → t, with a puff of air.',
    example: '타',
  },
  ㅍ: {
    sound: '“p”, as in pop',
    tip: 'Looks like *π* (pi): p for pi.',
    example: '파',
  },
  ㅎ: {
    sound: '“h”, as in hat',
    tip: 'A person wearing a *hat*: h for hat.',
    example: '하',
  },

  // Double consonants
  ㄲ: {
    sound: 'a tight “k”, as in sky',
    tip: 'Two ㄱ’s make a *tense* sound: tighten your throat, no puff of air.',
    example: '까',
  },
  ㄸ: {
    sound: 'a tight “t”, as in stop',
    tip: 'Two ㄷ’s: a *tense* t, like the t in stop.',
    example: '따',
  },
  ㅃ: {
    sound: 'a tight “p”, as in spin',
    tip: 'Two ㅂ’s: a *tense* p, like the p in spin.',
    example: '빠',
  },
  ㅆ: {
    sound: 'a sharp, hissing “s”',
    tip: 'Two ㅅ’s: a *sharper* s. Really hiss it.',
    example: '싸',
  },
  ㅉ: {
    sound: 'a tight “j”, like the zz in pizza',
    tip: 'Two ㅈ’s: a *tense* j, like the zz in pizza.',
    example: '짜',
  },
}
