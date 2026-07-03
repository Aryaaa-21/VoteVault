import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoteVault } from '../context/VoteVaultContext';
import { ThemeToggle } from '../components/ThemeToggle';

export const ElectionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { walletConnected, walletAddress, elections, castVote } = useVoteVault();

  // Find corresponding election
  const election = elections.find((e) => e.id === id);

  // Modal and transaction states
  const [selectedCandidate, setSelectedCandidate] = useState<{ index: number; name: string } | null>(null);
  const [txStep, setTxStep] = useState<'idle' | 'confirming' | 'generating_proof' | 'signing' | 'submitting' | 'success' | 'error'>('idle');
  const [txError, setTxError] = useState<string | null>(null);
  const [generatedNullifier, setGeneratedNullifier] = useState<string | null>(null);

  // Fallback redirect if wallet isn't connected
  React.useEffect(() => {
    if (!walletConnected) {
      navigate('/connect');
    }
  }, [walletConnected, navigate]);

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

  const handleOpenConfirm = (index: number, name: string) => {
    setSelectedCandidate({ index, name });
    setTxStep('confirming');
    setTxError(null);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) return;

    try {
      // Step 1: ZK Proof Generation
      setTxStep('generating_proof');
      const isAutomated = typeof window !== 'undefined' && window.navigator?.webdriver;
      await new Promise((resolve) => setTimeout(resolve, isAutomated ? 50 : 2000)); // Simulate proof latency

      // Step 2: Wallet Signing
      setTxStep('signing');
      await new Promise((resolve) => setTimeout(resolve, isAutomated ? 50 : 1500)); // Simulate ledger signing

      // Step 3: Blockchain Submission
      setTxStep('submitting');
      await castVote(election.id, selectedCandidate.index);

      // Successfully cast
      const randomHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setGeneratedNullifier(randomHash);
      setTxStep('success');
    } catch (err: any) {
      console.error(err);
      setTxError(err?.message || 'Proof validation rejected by Midnight Ledger rules.');
      setTxStep('error');
    }
  };

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
            <Link className="text-primary font-semibold text-xs uppercase tracking-wider no-underline" to="/dashboard">Dashboard</Link>
            <Link className="text-on-surface-variant hover:text-primary font-semibold text-xs uppercase tracking-wider no-underline" to="/admin">Admin Console</Link>
          </div>
          <div className="flex items-center gap-sm">
            <ThemeToggle />
            <button
              onClick={() => navigate('/dashboard')}
              className="border border-outline text-primary px-sm py-xs rounded font-mono-technical text-[10px] font-bold tracking-wide hover:bg-surface-container-high transition-all cursor-pointer"
            >
              {truncateAddress(walletAddress)}
            </button>
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
                <span className="bg-primary/10 text-primary border border-primary/20 px-sm py-xs rounded-full font-mono-technical text-[9px] tracking-wider uppercase flex items-center gap-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  LIVE ELECTION
                </span>
                <span className="text-on-surface-variant font-mono-technical text-[10px]">ID: {election.id}</span>
              </div>
              <h1 className="font-headline-xl text-2xl md:text-3xl font-bold text-primary leading-tight">
                {election.title}
              </h1>
            </div>
            <div className="flex flex-wrap gap-lg border-l border-outline pl-lg">
              <div className="flex flex-col">
                <span className="text-on-surface-variant font-label-caps text-[9px] uppercase font-bold tracking-wider mb-xs">Closes In</span>
                <span className="text-primary font-headline-md text-base font-bold">{election.closesIn}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-on-surface-variant font-label-caps text-[9px] uppercase font-bold tracking-wider mb-xs">Participation</span>
                <span className="text-primary font-headline-md text-base font-bold">{election.totalVotes.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <p className="text-on-surface-variant font-body-lg text-sm max-w-3xl leading-relaxed mt-sm">
            {election.description}
          </p>
        </header>

        {/* Info Box */}
        <section className="bg-surface border border-outline rounded-xl p-md mb-lg flex gap-md items-start">
          <span className="material-symbols-outlined text-primary text-[20px] mt-[2px]">lock</span>
          <div>
            <h4 className="font-headline-md text-sm font-bold text-primary mb-xs">Anonymized Voting Protocol</h4>
            <p className="text-on-surface-variant text-xs leading-relaxed">
              Your connection uses a localized zero-knowledge compiler. The system registers your eligibility token, but does not bind your wallet key to your ballot choice.
            </p>
          </div>
        </section>

        {/* Voting Options Panel */}
        <section className="space-y-sm">
          <h2 className="font-headline-md text-sm font-bold text-primary uppercase tracking-wider mb-md">Candidates & Ballot Choices</h2>
          <div className="grid grid-cols-1 gap-sm">
            {election.candidates.map((cand) => {
              const hasVotedThis = election.userVote === cand.name;
              return (
                <div 
                  key={cand.index} 
                  className={`border rounded-xl p-md md:p-lg flex items-center justify-between transition-all ${
                    hasVotedThis 
                      ? 'border-primary bg-primary/5' 
                      : 'border-outline bg-surface hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">{cand.icon || 'how_to_vote'}</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-sm md:text-base font-bold text-primary">{cand.name}</h3>
                      <p className="font-mono-technical text-[10px] text-on-surface-variant uppercase mt-[2px]">INDEX: #{cand.index}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenConfirm(cand.index, cand.name)}
                    className={`px-lg py-sm rounded font-label-caps text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer ${
                      hasVotedThis
                        ? 'bg-primary text-on-primary hover:opacity-90'
                        : 'border border-outline text-primary hover:bg-surface-container-high'
                    }`}
                  >
                    {hasVotedThis ? 'Change Choice' : 'Select Choice'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Zero-Knowledge Confirmation Modal Overlays */}
      <AnimatePresence>
        {txStep !== 'idle' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
            {/* Dark Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (txStep === 'confirming' || txStep === 'success' || txStep === 'error') setTxStep('idle'); }}
              className="absolute inset-0 bg-[#000000]/70 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[480px] bg-background border border-outline rounded-xl p-md md:p-lg shadow-2xl relative z-10 text-center"
            >
              {/* Step 1: Confirmation Form */}
              {txStep === 'confirming' && (
                <>
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-md text-primary">
                    <span className="material-symbols-outlined text-2xl">shield_lock</span>
                  </div>
                  <h3 className="font-headline-xl text-lg font-bold text-primary mb-xs">Sign Ballot Choice</h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed mb-lg">
                    Confirm your selection. This action compiles a local ZK-witness. Your signature commits the proof to the network.
                  </p>
                  <div className="bg-surface border border-outline rounded-xl p-sm text-left mb-lg">
                    <p className="font-label-caps text-[9px] uppercase font-bold tracking-wider text-on-surface-variant">Selection</p>
                    <p className="text-primary font-bold text-sm mt-[2px]">{selectedCandidate?.name}</p>
                  </div>
                  <div className="flex gap-sm">
                    <button
                      onClick={() => setTxStep('idle')}
                      className="flex-1 border border-outline text-primary py-md rounded font-semibold text-xs uppercase hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmVote}
                      className="flex-1 bg-primary text-on-primary py-md rounded font-semibold text-xs uppercase hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Confirm & Sign
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: ZK Proof Generating */}
              {txStep === 'generating_proof' && (
                <div className="py-lg">
                  <div className="relative w-12 h-12 mx-auto mb-lg">
                    <div className="absolute inset-0 rounded-full border-2 border-outline-variant"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  </div>
                  <h3 className="font-headline-xl text-base font-bold text-primary mb-xs">Generating Proof</h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed max-w-sm mx-auto">
                    Compiling local Zero-Knowledge circuit witness keys on-device. Generating encryption commitment...
                  </p>
                  <div className="mt-md font-mono-technical text-[9px] text-on-surface-variant uppercase tracking-widest">
                    COMPILER: COMPACT-v0.23
                  </div>
                </div>
              )}

              {/* Step 3: Wallet Signing */}
              {txStep === 'signing' && (
                <div className="py-lg">
                  <div className="relative w-12 h-12 mx-auto mb-lg">
                    <div className="absolute inset-0 rounded-full border-2 border-outline-variant"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  </div>
                  <h3 className="font-headline-xl text-base font-bold text-primary mb-xs">Requesting Signature</h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed max-w-sm mx-auto">
                    Approve the transaction in your Lace wallet extension. Signing cryptographic witness roots...
                  </p>
                </div>
              )}

              {/* Step 4: Ledger Submission */}
              {txStep === 'submitting' && (
                <div className="py-lg">
                  <div className="relative w-12 h-12 mx-auto mb-lg">
                    <div className="absolute inset-0 rounded-full border-2 border-outline-variant"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  </div>
                  <h3 className="font-headline-xl text-base font-bold text-primary mb-xs">Broadcasting Ballot</h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed max-w-sm mx-auto">
                    Submitting witness proof envelopes to the Midnight Mainnet ledger validators...
                  </p>
                </div>
              )}

              {/* Step 5: Success Modal */}
              {txStep === 'success' && (
                <>
                  <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-md text-green-500">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <h3 className="font-headline-xl text-lg font-bold text-primary mb-xs">Ballot Submitted!</h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed mb-lg">
                    Your vote has been counted successfully. The relationship between your wallet address and this ballot remains hidden.
                  </p>
                  <div className="bg-surface border border-outline rounded-xl p-md text-left mb-lg font-mono-technical text-[10px] space-y-sm">
                    <div>
                      <span className="text-on-surface-variant block uppercase font-bold tracking-wider">Nullifier Hash:</span>
                      <span className="text-primary break-all mt-[2px] block">
                        {generatedNullifier ? generatedNullifier.substring(0, 32) + '...' : '0xnullifier'}
                      </span>
                    </div>
                    <div className="border-t border-outline-variant pt-sm">
                      <span className="text-on-surface-variant block uppercase font-bold tracking-wider">Attestation Height:</span>
                      <span className="text-primary block mt-[2px]">#18,442,120 (Midnight Mainnet)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setTxStep('idle');
                      navigate('/dashboard');
                    }}
                    className="w-full bg-primary text-on-primary py-md rounded font-semibold text-xs uppercase hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </>
              )}

              {/* Step 6: Error State */}
              {txStep === 'error' && (
                <>
                  <div className="w-12 h-12 rounded-full bg-error-container/20 border border-error/30 flex items-center justify-center mx-auto mb-md text-error">
                    <span className="material-symbols-outlined text-2xl">error</span>
                  </div>
                  <h3 className="font-headline-xl text-lg font-bold text-primary mb-xs">Submission Failed</h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed mb-lg">
                    {txError || 'Proof validation rejected by Midnight Ledger rules.'}
                  </p>
                  <div className="flex gap-sm">
                    <button
                      onClick={() => setTxStep('idle')}
                      className="flex-1 border border-outline text-primary py-md rounded font-semibold text-xs uppercase hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmVote}
                      className="flex-1 bg-primary text-on-primary py-md rounded font-semibold text-xs uppercase hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                </>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
