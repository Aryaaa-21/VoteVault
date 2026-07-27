import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVoteVault } from '../context/VoteVaultContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { VotingModal } from '../components/VotingModal';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

export const ElectionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { elections } = useVoteVault();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const election = elections.find((e) => e.id === id) || elections[0];

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F5] font-body flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center space-x-2 text-xs font-mono text-[#8E8E93] hover:text-[#F5F5F5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="p-8 rounded-2xl bg-[#1E1E21] border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="font-mono text-xs text-[#8E8E93]">{election.id}</span>
            <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] ${
              election.isActive ? 'bg-[#6FCF97]/10 text-[#6FCF97]' : 'bg-white/10 text-[#C9C9C9]'
            }`}>
              {election.isActive ? `Closes in ${election.closesIn}` : 'Finalized'}
            </span>
          </div>

          <h1 className="font-heading font-bold text-3xl text-[#F5F5F5]">{election.title}</h1>
          <p className="text-sm text-[#C9C9C9] leading-relaxed">{election.description}</p>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="font-heading font-bold text-lg text-[#F5F5F5]">Candidate Choices</h3>
            <div className="space-y-3">
              {election.candidates.map((cand) => {
                const pct = election.totalVotes > 0 ? Math.round((cand.votes / election.totalVotes) * 100) : 0;
                return (
                  <div key={cand.index} className="p-4 rounded-xl bg-[#151517] border border-white/10 space-y-2">
                    <div className="flex justify-between text-xs font-mono text-[#F5F5F5]">
                      <span>{cand.name}</span>
                      <span>{pct}% ({cand.votes.toLocaleString()} votes)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#0B0B0C] overflow-hidden">
                      <div
                        className="h-full bg-[#6FCF97] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {election.isActive && (
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => setModalOpen(true)}
                className="w-full py-3.5 rounded-xl bg-[#F5F5F5] text-[#0B0B0C] font-bold text-sm hover:bg-[#C9C9C9] transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Cast Your Vote</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {modalOpen && (
        <VotingModal
          electionId={election.id}
          candidates={election.candidates}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};
