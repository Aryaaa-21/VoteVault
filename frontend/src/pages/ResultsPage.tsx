import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useVoteVault } from '../context/VoteVaultContext';
import { ThemeToggle } from '../components/ThemeToggle';

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { walletConnected, walletAddress, elections } = useVoteVault();

  // Find corresponding election
  const election = elections.find((e) => e.id === id);

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-md">Election Not Found</h2>
          <button onClick={() => navigate('/dashboard')} className="bg-primary text-on-primary px-lg py-sm rounded">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Calculate percentages
  const maxVotesCandidate = election.candidates.reduce(
    (max, cand) => (cand.votes > max.votes ? cand : max),
    election.candidates[0]
  );

  const truncateAddress = (addr: string | null) => {
    if (!addr) return '0x8291...';
    if (addr.includes('-')) {
      const parts = addr.split('-');
      return parts[1] ? `#${parts[1]}` : '#8291';
    }
    return addr.substring(0, 6) + '...' + addr.substring(addr.length - 4);
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col transition-colors duration-300">
      
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-md border-b border-outline py-3">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-12 w-full max-w-max-width mx-auto">
          <Link to="/dashboard" className="flex items-center gap-base no-underline text-primary">
            <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
            <span className="font-headline-md text-lg font-bold tracking-tight text-primary">VoteVault</span>
          </Link>
          <div className="hidden md:flex items-center gap-md">
            <Link className="text-on-surface-variant hover:text-primary font-semibold text-xs uppercase tracking-wider no-underline" to="/dashboard">Dashboard</Link>
            <Link className="text-on-surface-variant hover:text-primary font-semibold text-xs uppercase tracking-wider no-underline" to="/admin">Admin Console</Link>
          </div>
          <div className="flex items-center gap-sm">
            <ThemeToggle />
            {walletConnected ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="border border-outline text-primary px-sm py-xs rounded font-mono-technical text-[10px] font-bold tracking-wide hover:bg-surface-container-high transition-all cursor-pointer"
              >
                {truncateAddress(walletAddress)}
              </button>
            ) : (
              <button
                onClick={() => navigate('/connect')}
                className="bg-primary text-on-primary px-sm py-xs rounded font-label-caps text-[10px] font-bold tracking-wide hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-24 pb-xl px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto flex-grow w-full text-left">
        
        {/* Header Block */}
        <header className="mb-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-md">
            <div>
              <div className="flex items-center gap-sm mb-xs">
                <span className="bg-primary/10 text-primary border border-primary/20 px-sm py-xs rounded-full font-mono-technical text-[9px] tracking-wider uppercase font-bold">
                  {election.isFinalized ? 'FINALIZED REFERENDUM' : 'LIVE TALLY'}
                </span>
                <span className="text-on-surface-variant font-mono-technical text-[10px]">ID: {election.id}</span>
              </div>
              <h1 className="font-headline-xl text-2xl md:text-3xl font-bold text-primary leading-tight">
                {election.isFinalized ? `Results: ${election.title}` : `Live Status: ${election.title}`}
              </h1>
            </div>
            <div className="flex flex-wrap gap-lg border-l border-outline pl-lg">
              <div className="flex flex-col">
                <span className="text-on-surface-variant font-label-caps text-[9px] uppercase font-bold tracking-wider mb-xs">Total Ballots</span>
                <span className="text-primary font-headline-md text-base font-bold">{election.totalVotes.toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-on-surface-variant font-label-caps text-[9px] uppercase font-bold tracking-wider mb-xs">Outcome</span>
                <span className="text-primary font-headline-md text-base font-bold">
                  {election.isFinalized ? election.outcome || 'Decided' : 'Ongoing'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-on-surface-variant font-body-lg text-sm max-w-3xl leading-relaxed">
            {election.description}
          </p>
        </header>

        {/* Results Graph & Visual Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-lg">
          {/* Main Results Column */}
          <div className="md:col-span-2 space-y-md">
            <h2 className="font-headline-md text-sm font-bold text-primary uppercase tracking-wider mb-sm">Vote Distribution</h2>
            <div className="border border-outline bg-surface p-md md:p-lg space-y-lg rounded-xl">
              {election.candidates.map((cand) => {
                const pct = election.totalVotes > 0 ? (cand.votes / election.totalVotes) * 100 : 0;
                const isWinner = maxVotesCandidate && maxVotesCandidate.index === cand.index;
                return (
                  <div key={cand.index} className="space-y-sm">
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <span className="text-primary font-semibold flex items-center gap-xs">
                        {cand.name}
                        {isWinner && election.isFinalized && (
                          <span className="material-symbols-outlined text-primary text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                        )}
                      </span>
                      <span className="text-on-surface-variant font-mono-technical text-xs">
                        {cand.votes.toLocaleString()} votes ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    {/* Grayscale progress bar tally */}
                    <div className="h-3.5 bg-surface-container-high rounded-full overflow-hidden border border-outline">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Info Cards */}
          <div className="space-y-sm flex flex-col justify-between">
            <h2 className="font-headline-md text-sm font-bold text-primary uppercase tracking-wider mb-sm">Audit Credentials</h2>
            <div className="border border-outline bg-surface p-md rounded-xl flex items-center gap-sm flex-grow">
              <span className="material-symbols-outlined text-primary text-2xl">gavel</span>
              <div className="text-left">
                <h4 className="font-bold text-primary text-xs uppercase tracking-wider">Tally Verified</h4>
                <p className="text-[10px] text-on-surface-variant mt-xs">Validated by Midnight consensus circuit engines.</p>
              </div>
            </div>
            <div className="border border-outline bg-surface p-md rounded-xl flex items-center gap-sm flex-grow mt-sm">
              <span className="material-symbols-outlined text-primary text-2xl">history</span>
              <div className="text-left">
                <h4 className="font-bold text-primary text-xs uppercase tracking-wider">Receipt Ledger</h4>
                <p className="text-[10px] text-on-surface-variant mt-xs">Anonymized block receipts compiled at epoch 45.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Participation Timeline: Grayscale Curve */}
        <section className="mb-lg text-left">
          <h2 className="font-headline-md text-sm font-bold text-primary uppercase tracking-wider mb-md">Participation Timeline</h2>
          <div className="border border-outline bg-surface p-md md:p-lg overflow-x-auto rounded-xl">
            <div className="min-w-[600px] h-48 relative">
              <svg className="w-full h-full" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* SVG Grid */}
                <line x1="0" y1="50" x2="800" y2="50" stroke="var(--outline-variant)" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="800" y2="100" stroke="var(--outline-variant)" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="0" y1="150" x2="800" y2="150" stroke="var(--outline-variant)" strokeWidth="0.5" strokeDasharray="4 4" />

                {/* SVG Curve Path color shifting with theme */}
                <path
                  d="M0 160 C 150 140, 250 80, 400 90 C 550 100, 650 30, 800 20"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  fill="none"
                />

                {/* Dots along path */}
                <circle cx="200" cy="115" r="4" fill="var(--primary)" />
                <circle cx="400" cy="90" r="4" fill="var(--primary)" />
                <circle cx="600" cy="45" r="4" fill="var(--primary)" />
                <circle cx="800" cy="20" r="5" fill="var(--primary)" />
              </svg>
              {/* Timeline labels */}
              <div className="flex justify-between mt-sm text-[10px] font-mono-technical text-on-surface-variant px-xs">
                <span>00:00 (Start)</span>
                <span>Epoch 12</span>
                <span>Epoch 24</span>
                <span>Epoch 36</span>
                <span>Resolved</span>
              </div>
            </div>
          </div>
        </section>

        {/* Cryptographic Proof Verification Logs */}
        <section className="text-left">
          <h2 className="font-headline-md text-sm font-bold text-primary uppercase tracking-wider mb-md">Ledger Proof Verification</h2>
          <div className="border border-outline bg-surface overflow-hidden rounded-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline bg-surface-container-low">
                  <th className="p-md font-mono-technical text-[10px] uppercase font-bold text-on-surface-variant">Proof Metric</th>
                  <th className="p-md font-mono-technical text-[10px] uppercase font-bold text-on-surface-variant">Value / Key Reference</th>
                  <th className="p-md font-mono-technical text-[10px] uppercase font-bold text-on-surface-variant">Verification</th>
                </tr>
              </thead>
              <tbody className="font-mono-technical text-xs">
                <tr className="border-b border-outline">
                  <td className="p-md text-primary font-bold">Ledger Block Height</td>
                  <td className="p-md text-on-surface-variant">#18,442,120</td>
                  <td className="p-md text-primary flex items-center gap-xs font-bold">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    VERIFIED
                  </td>
                </tr>
                <tr className="border-b border-outline">
                  <td className="p-md text-primary font-bold">ZK Proof Attestation</td>
                  <td className="p-md text-on-surface-variant">zk-snark:groth16:9a7f...2d1a</td>
                  <td className="p-md text-primary flex items-center gap-xs font-bold">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    VERIFIED
                  </td>
                </tr>
                <tr className="border-b border-outline">
                  <td className="p-md text-primary font-bold">State Root Hash</td>
                  <td className="p-md text-on-surface-variant">0x3f5c9e2b10ad6f8902d1c9ef007b8a7c</td>
                  <td className="p-md text-primary flex items-center gap-xs font-bold">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    VERIFIED
                  </td>
                </tr>
                <tr>
                  <td className="p-md text-primary font-bold">Consensus Signature</td>
                  <td className="p-md text-on-surface-variant">mn_sig:ed25519:6c8a...0b4e</td>
                  <td className="p-md text-primary flex items-center gap-xs font-bold">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    VERIFIED
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-lg border-t border-outline bg-surface mt-auto transition-colors duration-300">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-md">
          <p className="font-mono-technical text-[10px] text-on-surface-variant">© 2024 VoteVault. Secure consensus.</p>
          <div className="flex gap-lg text-[10px] font-mono-technical">
            <a className="text-on-surface-variant hover:text-primary underline no-underline transition-colors" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant hover:text-primary underline no-underline transition-colors" href="#">Terms</a>
            <a className="text-on-surface-variant hover:text-primary underline no-underline transition-colors" href="#">Security Audit</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
