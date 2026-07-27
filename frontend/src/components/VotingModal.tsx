import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Candidate, useVoteVault } from '../context/VoteVaultContext';
import { Shield, CheckCircle2, Lock, Loader2, Copy, X } from 'lucide-react';

interface VotingModalProps {
  electionId: string;
  candidates: Candidate[];
  onClose: () => void;
}

export const VotingModal: React.FC<VotingModalProps> = ({ electionId, candidates, onClose }) => {
  const { castVote, walletConnected, connectWallet, addToast } = useVoteVault();
  
  const [step, setStep] = useState<'SELECT' | 'CONFIRM' | 'SUCCESS'>('SELECT');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{ nullifier: string; txHash: string } | null>(null);

  const selectedCandidate = selectedIndex !== null ? candidates[selectedIndex] : null;

  const handleSelectChoice = (index: number) => {
    setSelectedIndex(index);
    setStep('CONFIRM');
  };

  const handleConfirmAndSign = async () => {
    if (selectedIndex === null) return;
    if (!walletConnected) {
      await connectWallet('lace');
    }

    setIsSubmitting(true);

    try {
      const res = await castVote(electionId, selectedIndex);
      setReceipt(res);
      setStep('SUCCESS');
    } catch (err) {
      console.error('Vote submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyNullifier = () => {
    if (receipt?.nullifier) {
      navigator.clipboard.writeText(receipt.nullifier);
      addToast('Nullifier copied to clipboard', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#1E1E21] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8E8E93] hover:text-[#F5F5F5] transition-colors p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step 1: Select Candidate */}
        {step === 'SELECT' && (
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/10 text-xs font-mono text-[#F5F5F5] mb-2">
                <Shield className="w-3.5 h-3.5 text-[#6FCF97]" />
                <span>Zero-Knowledge Ballot</span>
              </div>
              <h2 className="font-heading font-bold text-xl text-[#F5F5F5]">Select Ballot Option</h2>
              <p className="text-xs text-[#8E8E93]">Choose a candidate option. Your identity is decoupled via ZK nullifiers.</p>
            </div>

            <div className="space-y-2.5">
              {candidates.map((cand) => (
                <button
                  key={cand.index}
                  onClick={() => handleSelectChoice(cand.index)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-[#151517] border border-white/10 hover:border-[#F5F5F5] hover:bg-white/5 transition-all text-left group"
                >
                  <div className="font-heading font-medium text-sm text-[#F5F5F5] group-hover:text-white">
                    {cand.name}
                  </div>
                  {/* Playwright requirement: button text "Select Choice" */}
                  <span className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-semibold text-[#F5F5F5] group-hover:bg-white group-hover:text-[#0B0B0C] transition-all">
                    Select Choice
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Confirm & Sign */}
        {step === 'CONFIRM' && selectedCandidate && (
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#6FCF97]/10 text-xs font-mono text-[#6FCF97] mb-2">
                <Lock className="w-3.5 h-3.5" />
                <span>ZK Witness Compilation Ready</span>
              </div>
              <h2 className="font-heading font-bold text-xl text-[#F5F5F5]">Confirm & Sign Ballot</h2>
              <p className="text-xs text-[#8E8E93]">Review selection. Zero-Knowledge proof and spent nullifier will be derived locally.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#151517] border border-white/10 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Selected Choice:</span>
                <span className="text-[#6FCF97] font-bold">{selectedCandidate.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Referendum ID:</span>
                <span className="text-[#F5F5F5]">{electionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Circuit:</span>
                <span className="text-[#F2C94C]">cast_vote</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#8E8E93] leading-relaxed">
              Your device will compute spent nullifier N = SHA256(Secret || ElectionID || Salt) in private browser memory. Your wallet address is omitted from on-chain state.
            </div>

            {/* Playwright requirement: button text "Confirm & Sign" */}
            <button
              onClick={handleConfirmAndSign}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#F5F5F5] text-[#0B0B0C] font-bold text-xs hover:bg-[#C9C9C9] transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating ZK Proof & Submitting...</span>
                </>
              ) : (
                <span>Confirm & Sign</span>
              )}
            </button>
          </div>
        )}

        {/* Step 3: Success Receipt */}
        {step === 'SUCCESS' && receipt && (
          <div className="space-y-5 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-[#6FCF97]/20 border border-[#6FCF97]/40 text-[#6FCF97] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              {/* Playwright requirement: text "Ballot Submitted!" */}
              <h2 className="font-heading font-bold text-xl text-[#F5F5F5]">Ballot Submitted!</h2>
              <p className="text-xs text-[#8E8E93] mt-1">Your vote has been anonymously aggregated into the public state tree.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#151517] border border-white/10 text-left space-y-2">
              {/* Playwright requirement: text "Nullifier Hash" */}
              <div className="text-xs font-mono text-[#8E8E93]">Nullifier Hash:</div>
              <div className="flex items-center justify-between p-2 rounded bg-[#0B0B0C] border border-white/10 font-mono text-xs text-[#6FCF97] break-all">
                <span className="truncate">{receipt.nullifier}</span>
                <button
                  onClick={copyNullifier}
                  className="ml-2 text-[#8E8E93] hover:text-[#F5F5F5] p-1"
                  title="Copy Nullifier"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs font-mono text-[#8E8E93] pt-2">Transaction Hash:</div>
              <div className="p-2 rounded bg-[#0B0B0C] border border-white/10 font-mono text-xs text-[#C9C9C9] truncate">
                {receipt.txHash}
              </div>
            </div>

            {/* Playwright requirement: button text "Return to Dashboard" */}
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F5F5] font-semibold text-xs transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
