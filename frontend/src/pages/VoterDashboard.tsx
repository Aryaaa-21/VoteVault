import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVoteVault } from '../context/VoteVaultContext';
import { ThemeToggle } from '../components/ThemeToggle';

export const VoterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { walletConnected, walletAddress, elections, disconnectWallet } = useVoteVault();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fallback redirect if wallet isn't connected
  React.useEffect(() => {
    if (!walletConnected) {
      navigate('/connect');
    }
  }, [walletConnected, navigate]);

  // Derived metrics from elections state
  const activeElections = elections.filter(e => e.isActive);
  const pastElections = elections.filter(e => !e.isActive);
  const userVotesCast = elections.filter(e => e.userVote).length;
  const totalVotesCast = 15 + userVotesCast;

  const handleLogout = () => {
    disconnectWallet();
    navigate('/');
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
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex gap-md border-l border-outline pl-md">
              <Link className="text-primary font-semibold text-xs uppercase tracking-wider no-underline" to="/dashboard">Dashboard</Link>
              <Link className="text-on-surface-variant hover:text-primary font-semibold text-xs uppercase tracking-wider no-underline" to="/admin">Admin Console</Link>
            </div>
          </div>

          <div className="flex items-center gap-sm">
            <ThemeToggle />
            
            {/* Wallet Info Badge */}
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
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-primary font-bold text-lg no-underline py-xs border-b border-outline">Dashboard</Link>
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary font-bold text-lg no-underline py-xs border-b border-outline">Admin Console</Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/admin');
              }}
              className="w-full bg-primary text-on-primary py-md rounded font-semibold text-sm uppercase cursor-pointer"
            >
              Create Election
            </button>
            <button
              onClick={handleLogout}
              className="w-full border border-outline text-primary py-md rounded font-semibold text-sm uppercase cursor-pointer"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow pt-24 pb-xl px-margin-mobile md:px-margin-desktop max-w-max-width w-full mx-auto">
        
        {/* Welcome Banner */}
        <section className="relative overflow-hidden mb-lg rounded-xl border border-outline min-h-[12rem] flex items-center p-md md:p-lg bg-surface transition-colors duration-300">
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
          <div className="relative z-10 text-left">
            <div className="inline-flex items-center gap-xs px-sm py-xs bg-primary/10 border border-primary/20 rounded-full mb-md">
              <span className="material-symbols-outlined text-[15px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="font-mono-technical text-[9px] uppercase tracking-wider text-primary">Identity Confirmed</span>
            </div>
            <h1 className="font-headline-xl text-2xl md:text-3xl font-bold text-primary mb-xs">
              Verified Voter {truncateAddress(walletAddress)}
            </h1>
            <p className="text-on-surface-variant text-sm max-w-[576px] leading-relaxed">
              Your biometric hash is active and synchronized. Your participation is protected by end-to-end zero-knowledge proof protocols.
            </p>
          </div>
        </section>

        {/* Widgets Bento Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-sm mb-lg">
          <div className="border border-outline bg-surface p-md rounded-xl text-left">
            <span className="material-symbols-outlined text-primary text-[20px] mb-xs">how_to_vote</span>
            <p className="font-label-caps text-on-surface-variant text-[9px] uppercase font-bold tracking-wider mb-xs">Active Elections</p>
            <h3 className="text-2xl font-bold text-primary">{activeElections.length}</h3>
          </div>
          <div className="border border-outline bg-surface p-md rounded-xl text-left">
            <span className="material-symbols-outlined text-primary text-[20px] mb-xs">ballot</span>
            <p className="font-label-caps text-on-surface-variant text-[9px] uppercase font-bold tracking-wider mb-xs">Votes Cast</p>
            <h3 className="text-2xl font-bold text-primary">{totalVotesCast}</h3>
          </div>
          <div className="border border-outline bg-surface p-md rounded-xl text-left">
            <span className="material-symbols-outlined text-primary text-[20px] mb-xs">monitoring</span>
            <p className="font-label-caps text-on-surface-variant text-[9px] uppercase font-bold tracking-wider mb-xs">Participation</p>
            <h3 className="text-2xl font-bold text-primary">98%</h3>
          </div>
          <div className="border border-outline bg-surface p-md rounded-xl text-left">
            <div className="flex justify-between items-center mb-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">security</span>
              <span className="text-[8px] font-bold px-sm py-[2px] bg-primary/10 text-primary border border-primary/20 rounded-full">ENCRYPTED</span>
            </div>
            <p className="font-label-caps text-on-surface-variant text-[9px] uppercase font-bold tracking-wider mb-xs">Privacy</p>
            <h3 className="text-2xl font-bold text-primary">Maximum</h3>
          </div>
        </section>

        {/* Active Elections List */}
        <section className="mb-xl text-left">
          <div className="flex items-center justify-between mb-md">
            <h2 className="font-headline-md text-lg font-bold text-primary uppercase tracking-wider">Active Elections</h2>
            <Link className="font-label-caps text-[10px] text-on-surface-variant hover:text-primary font-bold transition-colors flex items-center gap-xs no-underline" to="/dashboard">
              VIEW ALL <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {activeElections.map((elec) => (
              <motion.div 
                key={elec.id} 
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="border border-outline bg-surface rounded-xl overflow-hidden shadow-sm flex flex-col"
              >
                <div className="h-32 bg-surface-container-high overflow-hidden relative">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${elec.image || 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=800'}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
                  <div className="absolute bottom-sm left-sm">
                    <span className="bg-primary text-on-primary font-mono-technical text-[8px] px-sm py-xs rounded uppercase font-bold tracking-wider">
                      {elec.closesIn ? `Closes in ${elec.closesIn}` : 'ACTIVE'}
                    </span>
                  </div>
                </div>
                <div className="p-md flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-headline-md text-base font-bold text-primary mb-xs">{elec.title}</h3>
                    <p className="text-on-surface-variant text-xs mb-md line-clamp-2 leading-relaxed">{elec.description}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/election/${elec.id}`)}
                    className="w-full bg-transparent border border-outline text-primary font-label-caps text-xs py-md font-bold hover:bg-primary hover:text-on-primary transition-all uppercase cursor-pointer rounded"
                  >
                    {elec.userVote ? 'Modify Vote' : 'Cast Your Vote'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Past Elections List */}
        <section className="text-left">
          <h2 className="font-headline-md text-lg font-bold text-primary uppercase tracking-wider mb-md">Past Referendums</h2>
          <div className="border border-outline bg-surface rounded-xl divide-y divide-outline">
            {pastElections.map((elec) => (
              <div
                key={elec.id}
                onClick={() => navigate(`/results/${elec.id}`)}
                className="flex flex-col md:flex-row md:items-center justify-between p-md hover:bg-surface-container-low transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-md mb-sm md:mb-0">
                  <div className="w-10 h-10 bg-surface-container-high flex items-center justify-center rounded border border-outline text-primary">
                    <span className="material-symbols-outlined text-lg">
                      {elec.id.includes('PROT') || elec.id.includes('PV') ? 'terminal' : 'how_to_vote'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-body-lg text-sm text-primary font-bold">{elec.title}</h4>
                    <p className="font-mono-technical text-on-surface-variant text-xs mt-[2px]">Resolved: {elec.closesIn === 'Ended' ? 'June 15, 2024' : 'Recently'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-lg justify-between md:justify-end">
                  <div className="text-right">
                    <p className="font-label-caps text-[9px] text-on-surface-variant uppercase font-bold tracking-wider">Your Vote</p>
                    <p className="text-primary font-bold text-xs mt-[2px]">{elec.userVote || 'Abstained'}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="font-label-caps text-[9px] text-on-surface-variant uppercase font-bold tracking-wider">Result</p>
                    <span className="text-primary font-bold text-xs mt-[2px]">{elec.outcome || 'Finalized'}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/results/${elec.id}`);
                    }}
                    className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors bg-transparent border-0 cursor-pointer"
                    aria-label="View Audit Receipt"
                  >
                    receipt_long
                  </button>
                </div>
              </div>
            ))}
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
