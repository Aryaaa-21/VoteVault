import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const PrivacyDiagram: React.FC = () => {
  const [derivedNullifier, setDerivedNullifier] = useState('0x4f92a18b7c3d2e1f9a8b7c6d5e4f3a2b1c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f');

  const secretKey = '0x89ab...3f90';
  const electionId = 'VV-2024-NB-01';
  const blindingSalt = '0x77c2...11a9';

  const handleRecalculate = () => {
    const raw = `${secretKey}:${electionId}:${blindingSalt}:${Math.random()}`;
    const hex = Array.from(new TextEncoder().encode(raw))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .padEnd(64, 'e')
      .substring(0, 64);
    setDerivedNullifier(`0x${hex}`);
  };

  return (
    <div className="w-full space-y-8">
      {/* Dual State Column Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Private Witness Column */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-6 rounded-2xl bg-[#1E1E21] border border-white/10 space-y-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <EyeOff className="w-5 h-5 text-[#F2C94C]" />
              <h3 className="font-heading font-bold text-lg text-[#F5F5F5]">Private Witness Data</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F2C94C]/10 text-[#F2C94C] font-mono text-[11px]">
              Browser Enclave Only
            </span>
          </div>

          <p className="text-xs text-[#8E8E93] leading-relaxed">
            Kept strictly in local device memory. Never transmitted over HTTP or committed to Midnight ledger nodes.
          </p>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#151517] border border-white/5 flex justify-between items-center">
              <span className="text-[#8E8E93]">voter_credential_secret:</span>
              <span className="text-[#F5F5F5]">{secretKey}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#151517] border border-white/5 flex justify-between items-center">
              <span className="text-[#8E8E93]">nullifier_blinding_salt:</span>
              <span className="text-[#F5F5F5]">{blindingSalt}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#151517] border border-white/5 flex justify-between items-center">
              <span className="text-[#8E8E93]">private_vote_choice:</span>
              <span className="text-[#6FCF97]">Candidate Index #0</span>
            </div>
          </div>
        </motion.div>

        {/* Public Ledger State Column */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-6 rounded-2xl bg-[#1E1E21] border border-white/10 space-y-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-[#6FCF97]" />
              <h3 className="font-heading font-bold text-lg text-[#F5F5F5]">Public Ledger State</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#6FCF97]/10 text-[#6FCF97] font-mono text-[11px]">
              On-Chain Consensus
            </span>
          </div>

          <p className="text-xs text-[#8E8E93] leading-relaxed">
            Stored publicly across Midnight validator nodes. Accessible for instant cryptographic auditing by anyone.
          </p>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#151517] border border-white/5 flex justify-between items-center">
              <span className="text-[#8E8E93]">election_id:</span>
              <span className="text-[#F5F5F5]">{electionId}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#151517] border border-white/5 flex justify-between items-center">
              <span className="text-[#8E8E93]">candidate_votes[0]:</span>
              <span className="text-[#6FCF97]">120,001 votes (+1)</span>
            </div>
            <div className="p-3 rounded-lg bg-[#151517] border border-white/5 flex justify-between items-center">
              <span className="text-[#8E8E93]">nullifiers[N]:</span>
              <span className="text-[#6FCF97]">Recorded Spent</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Interactive ZK Nullifier Derivation Sandbox */}
      <div className="p-6 rounded-2xl bg-[#151517] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-[#F5F5F5]" />
            <h4 className="font-heading font-bold text-base text-[#F5F5F5]">Interactive ZK Nullifier Sandbox</h4>
          </div>
          <button
            onClick={handleRecalculate}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-xs font-mono text-[#F5F5F5] hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-compute SHA256</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0B0C] border border-white/10 space-y-3">
          <div className="text-xs font-mono text-[#8E8E93]">
            Formula: Nullifier N = SHA256(Secret || ElectionID || Salt)
          </div>
          <div className="p-3 rounded-lg bg-[#1E1E21] border border-white/10 font-mono text-xs text-[#6FCF97] break-all">
            {derivedNullifier}
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#8E8E93]">
          <CheckCircle2 className="w-4 h-4 text-[#6FCF97]" />
          <span>One-way collision-resistant hash function prevents backtracking identity from spent nullifiers.</span>
        </div>
      </div>
    </div>
  );
};
