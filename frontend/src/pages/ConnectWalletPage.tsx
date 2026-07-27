import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoteVault } from '../context/VoteVaultContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { WalletType } from '../wallet/WalletTypes';
import { Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const ConnectWalletPage: React.FC = () => {
  const { connectWallet, walletConnected, isConnecting, error } = useVoteVault();
  const navigate = useNavigate();

  const handleConnect = async (type: WalletType) => {
    try {
      await connectWallet(type);
      navigate('/dashboard');
    } catch (err) {
      console.error('Wallet connection failed:', err);
    }
  };

  React.useEffect(() => {
    if (walletConnected) {
      navigate('/dashboard');
    }
  }, [walletConnected, navigate]);

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F5] font-body flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col justify-center space-y-10 w-full">
        <div className="text-center space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto shadow-xl">
            <Shield className="w-6 h-6 text-[#F5F5F5]" />
          </div>
          <h1 className="font-heading font-bold text-3xl text-[#F5F5F5]">Connect Your Web3 Wallet</h1>
          <p className="text-xs text-[#8E8E93] leading-relaxed">
            Select a supported wallet provider to access zero-knowledge governance features on the Midnight Network.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[#EB5757]/10 border border-[#EB5757]/30 text-xs text-[#EB5757] flex items-center space-x-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
          {/* Lace Wallet Option (Primary for Midnight) */}
          <div className="p-5 rounded-2xl bg-[#1E1E21] border border-white/15 hover:border-white/30 transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-base text-[#F5F5F5]">Lace Wallet</span>
                <span className="px-2 py-0.5 rounded-full bg-[#6FCF97]/10 text-[#6FCF97] font-mono text-[10px]">
                  Official Midnight
                </span>
              </div>
              <p className="text-xs text-[#8E8E93]">
                Official Cardano & Midnight Network native wallet extension with integrated WASM zero-knowledge prover.
              </p>
            </div>

            {/* Playwright locator requirement: button:has-text("Connect Lace Wallet") */}
            <button
              onClick={() => handleConnect('lace')}
              disabled={isConnecting}
              className="w-full py-3 rounded-xl bg-[#F5F5F5] text-[#0B0B0C] font-bold text-xs hover:bg-[#C9C9C9] transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Connect Lace Wallet</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* WalletConnect Option */}
          <div className="p-5 rounded-2xl bg-[#1E1E21] border border-white/10 hover:border-white/20 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-base text-[#F5F5F5]">WalletConnect 2.0</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[#C9C9C9] font-mono text-[10px]">
                  Mobile Bridge
                </span>
              </div>
              <p className="text-xs text-[#8E8E93]">
                Connect using mobile wallet QR codes or multi-chain protocol bridge adapters.
              </p>
            </div>

            <button
              onClick={() => handleConnect('walletconnect')}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F5F5] font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
            >
              <span>Connect WalletConnect</span>
            </button>
          </div>

          {/* MetaMask / EVM Injected Option */}
          <div className="p-5 rounded-2xl bg-[#1E1E21] border border-white/10 hover:border-white/20 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-base text-[#F5F5F5]">MetaMask / Injected</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[#C9C9C9] font-mono text-[10px]">
                  Browser
                </span>
              </div>
              <p className="text-xs text-[#8E8E93]">
                Connect using standard Web3 browser extensions (`window.ethereum`).
              </p>
            </div>

            <button
              onClick={() => handleConnect('metamask')}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F5F5] font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
            >
              <span>Connect MetaMask</span>
            </button>
          </div>

          {/* Local Developer Simulation Wallet Option */}
          <div className="p-5 rounded-2xl bg-[#1E1E21] border border-white/10 hover:border-white/20 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-base text-[#F5F5F5]">Local Enclave Simulator</span>
                <span className="px-2 py-0.5 rounded-full bg-[#F2C94C]/10 text-[#F2C94C] font-mono text-[10px]">
                  Dev Mode
                </span>
              </div>
              <p className="text-xs text-[#8E8E93]">
                Client-side zero-knowledge witness simulator enclave for rapid testing.
              </p>
            </div>

            <button
              onClick={() => handleConnect('simulated')}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F5F5] font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
            >
              <span>Launch Simulator Wallet</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
