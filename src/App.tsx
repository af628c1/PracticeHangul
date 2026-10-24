import { Navigate, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LetterPracticePage from './pages/LetterPracticePage'
import WordPracticePage from './pages/WordPracticePage'
import ProgressPage from './pages/ProgressPage'
import LearnPage from './pages/LearnPage'
import LessonPage from './pages/LessonPage'
import AboutPage from './pages/AboutPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="learn/:lessonId" element={<LessonPage />} />
        <Route path="letters" element={<LetterPracticePage />} />
        <Route path="words" element={<WordPracticePage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
