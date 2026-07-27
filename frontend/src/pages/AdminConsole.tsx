import React, { useState } from 'react';
import { useVoteVault } from '../context/VoteVaultContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Plus, Trash2, Pause, FileCheck } from 'lucide-react';

export const AdminConsole: React.FC = () => {
  const { elections, createElection, endElectionEarly, publishResults, walletAddress } = useVoteVault();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [candidates, setCandidates] = useState<string[]>(['Option Yes', 'Option No']);
  const [isCreating, setIsCreating] = useState(false);

  const handleAddCandidate = () => {
    setCandidates((prev) => [...prev, `Option ${prev.length + 1}`]);
  };

  const handleRemoveCandidate = (index: number) => {
    if (candidates.length <= 2) return;
    setCandidates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCandidateChange = (index: number, value: string) => {
    setCandidates((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleSubmitNewElection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || candidates.some((c) => !c.trim())) return;

    setIsCreating(true);
    try {
      await createElection(title, description, candidates);
      setTitle('');
      setDescription('');
      setCandidates(['Option Yes', 'Option No']);
    } catch (err) {
      console.error('Failed to create election:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F5] font-body flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 w-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="font-heading font-bold text-3xl text-[#F5F5F5]">Admin Referendum Console</h1>
            <p className="text-xs text-[#8E8E93] mt-1 font-mono">
              Authorized Deployer Public Key: {walletAddress ? `${walletAddress.substring(0, 16)}...` : '0xDEV-ADMIN-KEY-0X12345'}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#F2C94C]/10 border border-[#F2C94C]/30 text-[#F2C94C] font-mono text-xs">
            Admin Mode Active
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create Election Form */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#1E1E21] border border-white/10 space-y-6">
            <div className="flex items-center space-x-2 border-b border-white/10 pb-4">
              <Plus className="w-5 h-5 text-[#6FCF97]" />
              <h2 className="font-heading font-bold text-xl text-[#F5F5F5]">Deploy New Referendum</h2>
            </div>

            <form onSubmit={handleSubmitNewElection} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#8E8E93]">Referendum Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Protocol Upgrade #14 Resolution"
                  className="w-full p-3 rounded-xl bg-[#151517] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#8E8E93] focus:outline-none focus:border-white/30 font-body"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#8E8E93]">Proposal Scope & Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide comprehensive details of the referendum proposal..."
                  className="w-full p-3 rounded-xl bg-[#151517] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#8E8E93] focus:outline-none focus:border-white/30 font-body"
                  required
                />
              </div>

              {/* Candidate Options List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-[#8E8E93]">Ballot Candidate Choices</label>
                  <button
                    type="button"
                    onClick={handleAddCandidate}
                    className="text-xs font-mono text-[#6FCF97] hover:underline flex items-center"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Choice
                  </button>
                </div>

                {candidates.map((cand, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={cand}
                      onChange={(e) => handleCandidateChange(idx, e.target.value)}
                      placeholder={`Candidate Option #${idx + 1}`}
                      className="w-full p-2.5 rounded-xl bg-[#151517] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none"
                      required
                    />
                    {candidates.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCandidate(idx)}
                        className="p-2.5 rounded-xl bg-white/5 text-[#EB5757] hover:bg-white/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-3 rounded-xl bg-[#F5F5F5] text-[#0B0B0C] font-bold text-xs hover:bg-[#C9C9C9] transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Deploy & Open Referendum Circuit</span>
              </button>
            </form>
          </div>

          {/* Manage Existing Elections */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-heading font-bold text-xl text-[#F5F5F5]">Lifecycle Controls</h2>

            <div className="space-y-3">
              {elections.map((elec) => (
                <div key={elec.id} className="p-4 rounded-xl bg-[#1E1E21] border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-heading font-bold text-sm text-[#F5F5F5]">{elec.title}</div>
                      <div className="text-[10px] font-mono text-[#8E8E93]">{elec.id}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      elec.isActive ? 'bg-[#6FCF97]/10 text-[#6FCF97]' : 'bg-white/10 text-[#8E8E93]'
                    }`}>
                      {elec.isActive ? 'ACTIVE' : elec.isFinalized ? 'FINALIZED' : 'CLOSED'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                    {elec.isActive && (
                      <button
                        onClick={() => endElectionEarly(elec.id)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#F2C94C] hover:bg-white/10 transition-colors flex items-center space-x-1"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Close Ballot</span>
                      </button>
                    )}

                    {!elec.isFinalized && (
                      <button
                        onClick={() => publishResults(elec.id)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#6FCF97] hover:bg-white/10 transition-colors flex items-center space-x-1"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Finalize Tallies</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
