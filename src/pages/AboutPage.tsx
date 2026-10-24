import { Link, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import TopBar from '../components/TopBar'
import TabBar from '../components/TabBar'

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <TopBar title="About" onBack={() => navigate('/')} />

      <article className="flex-1 max-w-xl w-full mx-auto px-6 py-8 flex flex-col gap-8 font-hand text-lg text-ink-soft leading-relaxed">
        <header>
          <h1 className="font-bold text-3xl text-ink leading-tight mb-2">
            Learn to read Korean, free
          </h1>
          <p className="text-muted">
            Practice Hangul teaches you the Korean alphabet with short lessons, memory tricks and
            quick quizzes, then helps you practice until reading feels natural.
          </p>
        </header>

        <Section title="What is Hangul?">
          <p>
            Hangul (한글) is the Korean alphabet. It was created in the 15th century under King
            Sejong the Great so that everyone, not just scholars, could learn to read and write.
          </p>
          <p>
            It has 14 basic consonants and 10 basic vowels. Letters stack into syllable blocks:
            ㅎ + ㅏ + ㄴ makes 한, and 한 + 글 makes 한글.
          </p>
        </Section>

        <Section title="How long does it take to learn?">
          <p>
            Hangul was designed to be easy. Most people can read it after a few hours of
            practice, and feel comfortable within a few days. Understanding what you read is the
            next step: that's learning the Korean language.
          </p>
        </Section>

        <Section title="How Practice Hangul works">
          <ul className="flex flex-col gap-2 list-disc pl-5">
            <li>
              <Link to="/learn" className="font-bold text-ink underline decoration-k-red decoration-2 underline-offset-4">
                Learn
              </Link>
              : 10 lessons teach all 40 letters in small groups, each with its sound and a memory
              trick.
            </li>
            <li>
              <Link to="/letters" className="font-bold text-ink underline decoration-k-red decoration-2 underline-offset-4">
                Letter Practice
              </Link>
              : a quick quiz on consonants and vowels.
            </li>
            <li>
              <Link to="/words" className="font-bold text-ink underline decoration-k-red decoration-2 underline-offset-4">
                Word Practice
              </Link>
              : read real Korean words and type how they sound.
            </li>
            <li>Sign in to save your streak and progress across devices. It's all free.</li>
          </ul>
        </Section>

        <Section title="A note on romanization">
          <p>
            Sounds are written in Revised Romanization, the official system in South Korea (so
            ㅓ is “eo”). English spellings are only a guide; listening to native speakers is the
            best way to tune your ear.
          </p>
        </Section>
      </article>

      <TabBar />
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-bold text-2xl text-ink">{title}</h2>
      {children}
    </section>
  )
}
