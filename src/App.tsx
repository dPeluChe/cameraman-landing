import { lazy } from 'react'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { Hero } from './sections/Hero'
import { LazySection } from './components/LazySection'

// Pre-created lazy components (declared at module scope, not inside render)
const LazyWhy = lazy(() => import('./sections/Why').then((m) => ({ default: m.Why })))
const LazyFeatures = lazy(() => import('./sections/Features').then((m) => ({ default: m.Features })))
const LazyAgents = lazy(() => import('./sections/Agents').then((m) => ({ default: m.Agents })))
const LazyComparison = lazy(() => import('./sections/Comparison').then((m) => ({ default: m.Comparison })))
const LazyTech = lazy(() => import('./sections/Tech').then((m) => ({ default: m.Tech })))
const LazyStatus = lazy(() => import('./sections/Status').then((m) => ({ default: m.Status })))
const LazyInstall = lazy(() => import('./sections/Install').then((m) => ({ default: m.Install })))

export default function App() {
  return (
    <>
      <div className="ambient-glow" />
      <Nav />
      <main>
        {/* Above-the-fold: eager loaded */}
        <Hero />

        {/* Below-the-fold: lazy loaded with fade-in + spinner fallback */}
        <LazySection component={LazyWhy} minHeight={420} />
        <LazySection component={LazyFeatures} minHeight={800} />
        <LazySection component={LazyAgents} minHeight={600} />
        <LazySection component={LazyComparison} minHeight={500} />
        <LazySection component={LazyTech} minHeight={450} />
        <LazySection component={LazyStatus} minHeight={300} />
        <LazySection component={LazyInstall} minHeight={500} />
      </main>
      <Footer />
    </>
  )
}
