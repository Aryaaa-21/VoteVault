import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PrivacyDiagram } from '../components/PrivacyDiagram';
import { Shield } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F5] font-body flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-mono text-[#6FCF97]">
            <Shield className="w-3.5 h-3.5" />
            <span>Zero-Knowledge Proof Architecture</span>
          </div>
          <h1 className="font-heading font-bold text-4xl text-[#F5F5F5]">Midnight Privacy Model</h1>
          <p className="text-sm text-[#8E8E93] leading-relaxed">
            VoteVault enforces strict separation between Public Ledger State and Private Witness Data. Learn how zero-knowledge SNARK proofs prove ballot validity without exposing voter identities.
          </p>
        </div>

        {/* Dual State Diagram Sandbox */}
        <PrivacyDiagram />

        {/* Mathematical Formulation Breakdown */}
        <div className="p-8 rounded-2xl bg-[#1E1E21] border border-white/10 space-y-6">
          <h2 className="font-heading font-bold text-2xl text-[#F5F5F5]">Mathematical Cryptographic Proof System</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-5 rounded-xl bg-[#151517] border border-white/10 space-y-2">
              <div className="text-[#8E8E93]">1. Private Voter Witness ($w$)</div>
              <div className="text-[#F5F5F5] font-bold">w = (S, r, c)</div>
              <p className="text-[11px] text-[#8E8E93]">
                Where S is voter credential secret, r is blinding salt, c is ballot choice index.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#151517] border border-white/10 space-y-2">
              <div className="text-[#8E8E93]">2. Deterministic Spent Nullifier ($N$)</div>
              <div className="text-[#6FCF97] font-bold">N = SHA256(S || ID || r)</div>
              <p className="text-[11px] text-[#8E8E93]">
                Unique 32-byte spent nullifier hash committed to the on-chain nullifier mapping.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#151517] border border-white/10 space-y-2">
              <div className="text-[#8E8E93]">3. ZK Proof Verification ($\pi$)</div>
              <div className="text-[#F2C94C] font-bold">Verify(vk, x, π) = true</div>
              <p className="text-[11px] text-[#8E8E93]">
                Verifies unspent nullifier and candidate index bounds without revealing w.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
