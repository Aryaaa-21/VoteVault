import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVoteVault } from '../context/VoteVaultContext';
import { ThemeToggle } from '../components/ThemeToggle';

export const AdminConsole: React.FC = () => {
  const navigate = useNavigate();
  const { walletConnected, walletAddress, elections, createElection, endElectionEarly, publishResults, disconnectWallet } = useVoteVault();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [candidatesStr, setCandidatesStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // System logs mock feed matching Stitch admin view
  const [logs, setLogs] = useState([
    { id: 1, type: 'SUCCESS', message: 'Consensus node synced at height #18,442,120', time: 'Just Now' },
    { id: 2, type: 'INFO', message: 'ZK-Proof verifier circuit initialized successfully', time: '5m ago' },
    { id: 3, type: 'WARN', message: 'Epoch transition 45 completed with 99.8% validator uptime', time: '12m ago' },
    { id: 4, type: 'SUCCESS', message: 'Admin signature key certified by Midnight SDK', time: '1h ago' }
  ]);

  // Fallback redirect if wallet isn't connected
  React.useEffect(() => {
    if (!walletConnected) {
      navigate('/connect');
    }
  }, [walletConnected, navigate]);

  const handleLogout = () => {
    disconnectWallet();
    navigate('/');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!title.trim() || !description.trim() || !candidatesStr.trim()) {
      setFormError('Please fill out all fields.');
      return;
    }

    const candidateArray = candidatesStr
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (candidateArray.length < 2) {
      setFormError('Please register at least 2 options / candidates.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate new referendum via smart contract deployment
      await createElection(title, description, candidateArray);

      // Add to system log
      setLogs(prev => [
        {
          id: Date.now(),
          type: 'SUCCESS',
          message: `Referendum deployed: "${title}" (ZK circuit compiled)`,
          time: 'Just Now'
        },
        ...prev
      ]);

      // Reset form
      setTitle('');
      setDescription('');
      setCandidatesStr('');
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 5000);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create election.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const truncateAddress = (addr: string | null) => {
    if (!addr) return '#8291';
    if (addr.includes('-')) {
      const parts = addr.split('-');
      return parts[1] ? `#${parts[1]}` : '#8291';
    }
    return addr.substring(0, 6) + '...' + addr.substring(addr.length - 4);
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen transition-colors duration-300 flex flex-col">
      
      {/* Sticky Navigation Header */}
      <nav className="fixed top-0 w-full z-50 border-b border-outline bg-background/80 backdrop-blur-md py-3">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-12 w-full max-w-max-width mx-auto">
          <div className="flex items-center gap-md">
            <Link to="/" className="flex items-center gap-base no-underline text-primary">
              <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
              <span className="font-headline-md text-lg font-bold tracking-tight text-primary">VoteVault</span>
            </Link>
            <div className="hidden md:flex gap-md border-l border-outline pl-md">
              <Link className="text-on-surface-variant hover:text-primary font-semibold text-xs uppercase tracking-wider no-underline" to="/dashboard">Dashboard</Link>
              <Link className="text-primary font-semibold text-xs uppercase tracking-wider no-underline" to="/admin">Admin Console</Link>
            </div>
          </div>

          <div className="flex items-center gap-sm">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-xs px-sm py-xs bg-surface border border-outline rounded-full text-xs font-mono-technical text-primary">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span>{walletAddress ? walletAddress.substring(0, 8) + '...' : 'Connected'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="border border-outline text-primary px-sm py-xs rounded font-label-caps text-[10px] font-bold tracking-wide hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer"
            >
              Disconnect
            </button>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-primary bg-transparent border-0 cursor-pointer p-xs flex items-center" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background z-40 flex flex-col p-lg border-b border-outline">
          <div className="space-y-md flex flex-col">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary font-bold text-lg no-underline py-xs border-b border-outline">Dashboard</Link>
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-primary font-bold text-lg no-underline py-xs border-b border-outline">Admin Console</Link>
            <button
              onClick={handleLogout}
              className="w-full border border-outline text-primary py-md rounded font-semibold text-sm uppercase cursor-pointer"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}

      {/* Main Console Canvas */}
      <main className="flex-grow pt-24 pb-xl px-margin-mobile md:px-margin-desktop max-w-max-width w-full mx-auto text-left">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-lg">
          <div>
            <h1 className="font-headline-xl text-2xl md:text-3xl font-bold text-primary tracking-tight">System Console</h1>
            <p className="text-on-surface-variant text-sm mt-xs">Configure, monitor, and finalize cryptographic voting protocols.</p>
          </div>
          <div className="bg-surface border border-outline px-md py-xs rounded-full flex items-center gap-sm">
            <span className="font-mono-technical text-xs text-on-surface-variant">Admin: {truncateAddress(walletAddress)}</span>
          </div>
        </div>

        {/* Bento Widgets Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-sm mb-lg">
          <div className="border border-outline bg-surface p-md rounded-xl">
            <span className="material-symbols-outlined text-primary text-[20px] mb-xs">how_to_vote</span>
            <p className="font-label-caps text-on-surface-variant text-[9px] uppercase font-bold tracking-wider mb-xs">Active Referendums</p>
            <h3 className="text-2xl font-bold text-primary">{elections.filter(e => e.isActive).length}</h3>
          </div>
          <div className="border border-outline bg-surface p-md rounded-xl">
            <span className="material-symbols-outlined text-primary text-[20px] mb-xs">group</span>
            <p className="font-label-caps text-on-surface-variant text-[9px] uppercase font-bold tracking-wider mb-xs">Registered Voters</p>
            <h3 className="text-2xl font-bold text-primary">1,240</h3>
          </div>
          <div className="border border-outline bg-surface p-md rounded-xl">
            <div className="flex justify-between items-center mb-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">dns</span>
              <span className="text-[8px] font-bold px-sm py-[2px] bg-primary/10 text-primary border border-primary/20 rounded-full">ONLINE</span>
            </div>
            <p className="font-label-caps text-on-surface-variant text-[9px] uppercase font-bold tracking-wider mb-xs">Node Status</p>
            <h3 className="text-2xl font-bold text-primary">OPERATIONAL</h3>
          </div>
        </section>

        {/* Form and System Logs Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          
          {/* Election Creation & Management */}
          <div className="lg:col-span-2 space-y-lg">
            
            {/* Deploy Referendum Form */}
            <div className="border border-outline bg-surface p-md md:p-lg rounded-xl space-y-md">
              <div>
                <h2 className="font-headline-md text-base font-bold text-primary">Deploy Referendum</h2>
                <p className="text-on-surface-variant text-xs mt-[2px]">Deploy a new smart contract and compile ZK-circuits to start a referendum.</p>
              </div>

              {formError && (
                <div className="bg-error-container/10 border border-error/20 p-sm rounded text-error text-xs font-semibold">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="bg-primary/10 border border-primary/20 p-sm rounded text-primary text-xs font-semibold">
                  Smart contract deployed successfully! Zero-knowledge circuit generated.
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-md">
                <div className="space-y-xs">
                  <label className="block font-label-caps text-[9px] text-on-surface-variant uppercase font-bold tracking-wider">Referendum Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Protocol Upgrade #13"
                    className="w-full bg-background border border-outline p-md rounded text-sm text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="block font-label-caps text-[9px] text-on-surface-variant uppercase font-bold tracking-wider">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the scope, options, and governance rules of the vote..."
                    className="w-full bg-background border border-outline p-md rounded text-sm text-primary focus:border-primary focus:outline-none resize-none"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="block font-label-caps text-[9px] text-on-surface-variant uppercase font-bold tracking-wider">Options / Candidates (Comma Separated)</label>
                  <input
                    type="text"
                    value={candidatesStr}
                    onChange={e => setCandidatesStr(e.target.value)}
                    placeholder="e.g. Option A: Yes, Option B: No"
                    className="w-full bg-background border border-outline p-md rounded text-sm text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-on-primary py-md font-label-caps text-xs font-bold rounded hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Compiling circuits...' : 'Submit Referendum to Blockchain'}
                </button>
              </form>
            </div>

            {/* Referendum Control Center */}
            <div className="space-y-sm">
              <h2 className="font-headline-md text-sm font-bold text-primary uppercase tracking-wider mb-sm">Referendum Control Center</h2>
              <div className="border border-outline bg-surface rounded-xl divide-y divide-outline">
                {elections.map((elec) => (
                  <div key={elec.id} className="p-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
                    <div>
                      <div className="flex items-center gap-xs">
                        <h4 className="font-body-lg text-sm text-primary font-bold">{elec.title}</h4>
                        <span className={`text-[8px] px-sm py-[2px] rounded uppercase font-bold border ${
                          elec.isActive ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-container-high text-on-surface-variant border-outline'
                        }`}>
                          {elec.isActive ? 'ACTIVE' : elec.isFinalized ? 'FINALIZED' : 'CLOSED'}
                        </span>
                      </div>
                      <p className="font-mono-technical text-[9px] text-on-surface-variant mt-xs">ID: {elec.id} | Votes: {elec.totalVotes}</p>
                    </div>
                    <div className="flex gap-md w-full sm:w-auto">
                      {elec.isActive && (
                        <button
                          onClick={() => endElectionEarly(elec.id)}
                          className="flex-1 sm:flex-none border border-outline text-primary px-md py-xs rounded text-[10px] font-bold hover:bg-surface-container-high cursor-pointer uppercase tracking-wider"
                        >
                          End Referendum
                        </button>
                      )}
                      {!elec.isFinalized && (
                        <button
                          onClick={() => publishResults(elec.id)}
                          className="flex-1 sm:flex-none bg-primary text-on-primary px-md py-xs rounded text-[10px] font-bold hover:opacity-90 cursor-pointer uppercase tracking-wider"
                        >
                          Finalize & Publish
                        </button>
                      )}
                      {elec.isFinalized && (
                        <button
                          onClick={() => navigate(`/results/${elec.id}`)}
                          className="flex-1 sm:flex-none border border-outline text-primary px-md py-xs rounded text-[10px] font-bold hover:bg-surface-container-high cursor-pointer uppercase tracking-wider"
                        >
                          View Outcomes
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* System Logs & Audit */}
          <div className="space-y-lg">
            
            {/* Live Logs */}
            <div className="border border-outline bg-surface p-md rounded-xl">
              <h3 className="font-headline-md text-sm font-bold text-primary uppercase tracking-wider mb-sm">Consensus Live Logs</h3>
              <div className="space-y-md max-h-[360px] overflow-y-auto pr-xs">
                {logs.map((log) => (
                  <div key={log.id} className="font-mono-technical text-[10px] space-y-xs pb-sm border-b border-outline last:border-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">
                        [{log.type}]
                      </span>
                      <span className="text-on-surface-variant/50">{log.time}</span>
                    </div>
                    <p className="text-on-surface-variant leading-normal text-left">{log.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ledger Metrics */}
            <div className="border border-outline bg-surface p-md rounded-xl relative overflow-hidden">
              <h4 className="font-headline-md text-sm font-bold text-primary uppercase tracking-wider mb-sm">Ledger Metrics</h4>
              <div className="space-y-sm text-xs font-mono-technical text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Epoch Number:</span>
                  <span className="text-primary">45</span>
                </div>
                <div className="flex justify-between">
                  <span>Block Time:</span>
                  <span className="text-primary">2.1s</span>
                </div>
                <div className="flex justify-between">
                  <span>Peers Connected:</span>
                  <span className="text-primary">182 / 182</span>
                </div>
                <div className="flex justify-between">
                  <span>ZKP Proof Latency:</span>
                  <span className="text-primary">~1.4s</span>
                </div>
              </div>
            </div>

          </div>

        </div>
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
