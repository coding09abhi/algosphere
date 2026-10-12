import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import AlgorithmWorkspacePage from './pages/AlgorithmWorkspacePage'
import ComplexityLabPage from './pages/ComplexityLabPage'
import ExplorePage from './pages/ExplorePage'
import HomePage from './pages/HomePage'
import PlaygroundPage from './pages/PlaygroundPage'
import RoadmapPage from './pages/RoadmapPage'

const App = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/algorithm/:slug" element={<AlgorithmWorkspacePage />} />
        <Route path="/complexity-lab" element={<ComplexityLabPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  )
}

export default App
