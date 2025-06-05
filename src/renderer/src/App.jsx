import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import {
  Dashboard,
  LoginPage,
  GenerateReports,
  AddRecords,
  ActivateTanks,
  GenerateGraphs,
  EditTanks,
  GenerateAverageFoodWeight
} from './components/pages'
import { IntroDocsPage, DocumentationTemplate } from './components/pages/documentation'
import { docs } from './components/pages/documentation/markdown'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/generateReports" element={<GenerateReports />} />
        <Route path="/addRecords" element={<AddRecords />} />
        <Route path="/addRecords/:id" element={<AddRecords />} />
        <Route path="/activateTanks" element={<ActivateTanks />} />
        <Route path="/generateGraphs" element={<GenerateGraphs />} />
        <Route path="/averageFoodWeight" element={<GenerateAverageFoodWeight />} />
        <Route path="/editTanks" element={<EditTanks />} />
        <Route path="/editTanks/:id" element={<EditTanks />} />

        <Route path="/documentation" element={<IntroDocsPage />} />

        {/* Dynamically generate slugs for docs */}
        {Object.entries(docs).map(([slug, doc]) => (
          <Route
            key={slug}
            path={`/docs/${slug}`}
            element={<DocumentationTemplate content={doc.content} />}
          />
        ))}
      </Routes>
    </Router>
  )
}

export default App
