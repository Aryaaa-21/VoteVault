import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { VoteVaultProvider } from './context/VoteVaultContext';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './pages/LandingPage';
import { ConnectWalletPage } from './pages/ConnectWalletPage';
import { VoterDashboard } from './pages/VoterDashboard';
import { ElectionPage } from './pages/ElectionPage';
import { ResultsPage } from './pages/ResultsPage';
import { AdminConsole } from './pages/AdminConsole';

function App() {
  return (
    <ThemeProvider>
      <VoteVaultProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/connect" element={<ConnectWalletPage />} />
            <Route path="/dashboard" element={<VoterDashboard />} />
            <Route path="/election/:id" element={<ElectionPage />} />
            <Route path="/results/:id" element={<ResultsPage />} />
            <Route path="/admin" element={<AdminConsole />} />
          </Routes>
        </Router>
      </VoteVaultProvider>
    </ThemeProvider>
  );
}

export default App;
