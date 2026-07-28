import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { VoteVaultProvider } from './context/VoteVaultContext';
import { ToastContainer } from './components/ToastContainer';
import { CommandPalette } from './components/CommandPalette';

import { LandingPage } from './pages/LandingPage';
import { VoterDashboard } from './pages/VoterDashboard';
import { PrivacyPage } from './pages/PrivacyPage';
import { ResultsPage } from './pages/ResultsPage';
import { ConnectWalletPage } from './pages/ConnectWalletPage';
import { AdminConsole } from './pages/AdminConsole';
import { DeveloperPage } from './pages/DeveloperPage';
import { DocsPage } from './pages/DocsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ElectionPage } from './pages/ElectionPage';

export function App() {
  return (
    <ThemeProvider>
      <VoteVaultProvider>
        <Router>
          <CommandPalette />
          <ToastContainer />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<VoterDashboard />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/connect" element={<ConnectWalletPage />} />
            <Route path="/admin" element={<AdminConsole />} />
            <Route path="/developer" element={<DeveloperPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/election/:id" element={<ElectionPage />} />
            {/* Catch-all fallback */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Router>
      </VoteVaultProvider>
    </ThemeProvider>
  );
}

export default App;
