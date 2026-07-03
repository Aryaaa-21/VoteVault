import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoteVault } from '../context/VoteVaultContext';
import { ThemeToggle } from '../components/ThemeToggle';

export const ConnectWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { walletConnected, isConnecting, error, connectWallet, clearError } = useVoteVault();
  const [cursorGlowPos, setCursorGlowPos] = useState({ x: -1000, y: -1000 });

  // Redirect to dashboard if already connected
  useEffect(() => {
    if (walletConnected) {
      navigate('/dashboard');
    }
  }, [walletConnected, navigate]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorGlowPos({ x: e.clientX, y: e.clientY });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleConnect = async (type: 'lace' | 'walletconnect' | 'metamask') => {
    try {
      await connectWallet(type);
    } catch {
      // Error handled by context
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background relative overflow-hidden font-body-md transition-colors duration-300">
      
      {/* Background ambient glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Mouse cursor glow following div */}
      <div
        className="fixed pointer-events-none z-1 rounded-full opacity-40 dark:opacity-100 transition-opacity duration-300"
        style={{
          left: `${cursorGlowPos.x}px`,
          top: `${cursorGlowPos.y}px`,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, var(--glow-color) 0%, rgba(0,0,0,0) 70%)',
          transform: 'translate(-50%, -50%)',
        }}
      ></div>

      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 border-b border-outline bg-background/80 backdrop-blur-md py-4">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-12 w-full max-w-max-width mx-auto">
          <Link to="/" className="flex items-center gap-base no-underline text-primary">
            <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
            <span className="font-headline-md text-lg font-bold tracking-tight text-primary">VoteVault</span>
          </Link>
          <div className="flex items-center gap-sm">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Connection Panel */}
      <main className="flex-grow flex items-center justify-center px-margin-mobile pt-32 pb-xl z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[480px] glass-card rounded-xl p-lg md:p-xl flex flex-col items-center border border-outline shadow-xl"
        >
          <div className="mb-lg text-center">
            <h2 className="font-headline-xl text-2xl font-bold text-primary mb-xs">Secure Portal</h2>
            <p className="text-on-surface-variant text-sm">Connect your credentials to access the zero-knowledge environment.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full bg-error-container/10 border border-error/20 p-sm rounded mb-md text-center text-sm flex flex-col items-center gap-xs overflow-hidden"
              >
                <p className="text-error font-medium text-xs">{error}</p>
                <button
                  onClick={clearError}
                  className="bg-transparent border-0 underline text-[10px] text-on-surface-variant hover:text-primary cursor-pointer"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full space-y-md mb-lg">
            <button
              onClick={() => handleConnect('lace')}
              disabled={isConnecting}
              className="w-full group bg-primary text-on-primary py-md px-lg rounded flex items-center justify-between hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-base">
                <div className="w-8 h-8 rounded-full bg-on-primary/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-[18px]">
                    {isConnecting ? 'hourglass_empty' : 'account_balance_wallet'}
                  </span>
                </div>
                <span className="font-headline-md text-sm font-semibold">
                  {isConnecting ? 'Connecting Lace...' : 'Connect Lace Wallet'}
                </span>
              </div>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-[18px]">arrow_forward</span>
            </button>

            <div className="flex items-center gap-base px-xs">
              <div className="h-[1px] flex-grow bg-outline"></div>
              <span className="font-label-caps text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Alternative Links</span>
              <div className="h-[1px] flex-grow bg-outline"></div>
            </div>

            <div className="grid grid-cols-2 gap-sm">
              <button
                onClick={() => handleConnect('walletconnect')}
                disabled={isConnecting}
                className="flex items-center justify-center gap-xs py-md px-sm border border-outline rounded hover:bg-surface-container-high transition-colors hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-primary"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">link</span>
                <span className="font-label-caps text-xs font-semibold">WalletConnect</span>
              </button>
              <button
                onClick={() => handleConnect('metamask')}
                disabled={isConnecting}
                className="flex items-center justify-center gap-xs py-md px-sm border border-outline rounded hover:bg-surface-container-high transition-colors hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-primary"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">token</span>
                <span className="font-label-caps text-xs font-semibold">MetaMask</span>
              </button>
            </div>
          </div>

          <div className="w-full space-y-md border-t border-outline pt-lg">
            <div className="flex flex-wrap justify-center gap-xs">
              <div className="flex items-center gap-xs px-sm py-xs bg-surface border border-outline rounded-full">
                <span className="material-symbols-outlined text-[13px] text-primary">verified_user</span>
                <span className="font-mono-technical text-[9px] uppercase tracking-wider text-on-surface-variant">ZK-Shield Active</span>
              </div>
              <div className="flex items-center gap-xs px-sm py-xs bg-surface border border-outline rounded-full">
                <span className="material-symbols-outlined text-[13px] text-primary">gavel</span>
                <span className="font-mono-technical text-[9px] uppercase tracking-wider text-on-surface-variant">Ledger Verifiable</span>
              </div>
            </div>
            <p className="font-mono-technical text-center text-[9px] text-on-surface-variant/40">
              ENCRYPTION: AES-256-GCM | SESSION: ISOLATED | ID: 89FB-X12
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full py-lg border-t border-outline bg-surface transition-colors duration-300 z-10">
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
