import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Terminal, Copy, Check } from 'lucide-react';

export const DeveloperPage: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);

  const sampleSnippet = `import { MidnightClient } from '@votevault/sdk';
import { WalletLayer, ProofLayer, TransactionLayer } from '@votevault/midnight';

// Initialize Midnight SDK layers
const wallet = new WalletLayer();
const session = await wallet.connect('lace');

// Generate client witness proof locally
const prover = new ProofLayer();
const proof = await prover.generateCastVoteProof('VV-2024-NB-01', 0, session.address);

// Submit transaction to consensus nodes
const tx = new TransactionLayer();
const receipt = await tx.submitVoteTransaction('VV-2024-NB-01', 0, session.address);

console.log('Spent Nullifier:', receipt.nullifier);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F5] font-body flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 w-full">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-3xl text-[#F5F5F5]">Developer API & Midnight SDK</h1>
            <p className="text-xs text-[#8E8E93] mt-1">
              Build custom governance interfaces using the modular VoteVault SDK and Compact contract schemas.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/10 font-mono text-xs text-[#6FCF97]">
            Compact v0.23 Ready
          </span>
        </div>

        {/* Code Snippet Viewer */}
        <div className="p-6 rounded-2xl bg-[#1E1E21] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 font-mono text-xs text-[#C9C9C9]">
              <Terminal className="w-4 h-4 text-[#6FCF97]" />
              <span>sdk-example.ts</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-[#F5F5F5] transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#6FCF97]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-[#0B0B0C] border border-white/10 overflow-x-auto text-xs font-code text-[#F5F5F5] leading-relaxed">
            {sampleSnippet}
          </pre>
        </div>
      </main>

      <Footer />
    </div>
  );
};
