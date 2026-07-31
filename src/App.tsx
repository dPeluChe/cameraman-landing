import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { Hero } from './sections/Hero'
import { Why } from './sections/Why'
import { Features } from './sections/Features'
import { Agents } from './sections/Agents'
import { Comparison } from './sections/Comparison'
import { Tech } from './sections/Tech'
import { Status } from './sections/Status'
import { Install } from './sections/Install'

export default function App() {
  return (
    <>
      <div className="ambient-glow" />
      <Nav />
      <main>
        <Hero />
        <Why />
        <Features />
        <Agents />
        <Comparison />
        <Tech />
        <Status />
        <Install />
      </main>
      <Footer />
    </>
  )
}

