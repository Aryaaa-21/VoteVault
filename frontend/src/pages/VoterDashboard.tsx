import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoteVault, Election } from '../context/VoteVaultContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { VotingModal } from '../components/VotingModal';
import { Vote, Search, ShieldCheck, Clock, CheckCircle2, FileSpreadsheet, ArrowUpRight } from 'lucide-react';

export const VoterDashboard: React.FC = () => {
  const { elections } = useVoteVault();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'FINALIZED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElectionForVoting, setSelectedElectionForVoting] = useState<Election | null>(null);

  const filteredElections = elections.filter((e) => {
    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'ACTIVE' && e.isActive) ||
      (activeTab === 'FINALIZED' && !e.isActive);
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const activeCount = elections.filter((e) => e.isActive).length;
  const finalizedCount = elections.filter((e) => !e.isActive).length;

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F5] font-body flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full">
        {/* Header & Overview Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="font-heading font-bold text-3xl text-[#F5F5F5]">Governance Dashboard</h1>
            <p className="text-xs text-[#8E8E93] mt-1">
              Participate anonymously in active referendums or verify cryptographic audit receipts for past elections.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-[#1E1E21] border border-white/10 flex items-center space-x-3">
              <Vote className="w-5 h-5 text-[#6FCF97]" />
              <div>
                <div className="text-[10px] font-mono text-[#8E8E93] uppercase">Active Referendums</div>
                <div className="font-heading font-bold text-base text-[#F5F5F5]">{activeCount}</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#1E1E21] border border-white/10 flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-[#C9C9C9]" />
              <div>
                <div className="text-[10px] font-mono text-[#8E8E93] uppercase">Finalized Audits</div>
                <div className="font-heading font-bold text-base text-[#F5F5F5]">{finalizedCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 p-1 rounded-xl bg-[#1E1E21] border border-white/10 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'ALL' ? 'bg-white/10 text-[#F5F5F5]' : 'text-[#8E8E93] hover:text-[#F5F5F5]'
              }`}
            >
              All ({elections.length})
            </button>
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'ACTIVE' ? 'bg-[#6FCF97]/20 text-[#6FCF97]' : 'text-[#8E8E93] hover:text-[#F5F5F5]'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab('FINALIZED')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'FINALIZED' ? 'bg-white/10 text-[#F5F5F5]' : 'text-[#8E8E93] hover:text-[#F5F5F5]'
              }`}
            >
              Finalized ({finalizedCount})
            </button>
          </div>

          <div className="relative max-w-full sm:max-w-xs w-full">
            <Search className="w-4 h-4 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search referendums..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1E1E21] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#8E8E93] focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        {/* Referendum Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredElections.map((elec) => (
            <div
              key={elec.id}
              className="p-6 rounded-2xl bg-[#1E1E21] border border-white/10 hover:border-white/20 transition-all space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#8E8E93]">{elec.id}</span>
                  {elec.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#6FCF97]/10 text-[#6FCF97] font-mono text-[11px]">
                      <Clock className="w-3 h-3 mr-1" />
                      Closes in {elec.closesIn}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 text-[#C9C9C9] font-mono text-[11px]">
                      Finalized
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-xl text-[#F5F5F5]">{elec.title}</h3>
                <p className="text-xs text-[#8E8E93] line-clamp-2 leading-relaxed">{elec.description}</p>
              </div>

              {/* Candidate Tallies Preview */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between text-[11px] font-mono text-[#8E8E93]">
                  <span>Candidate Choices</span>
                  <span>Total Votes: {elec.totalVotes.toLocaleString()}</span>
                </div>
                <div className="space-y-1.5">
                  {elec.candidates.slice(0, 3).map((cand) => {
                    const pct = elec.totalVotes > 0 ? Math.round((cand.votes / elec.totalVotes) * 100) : 0;
                    return (
                      <div key={cand.index} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono text-[#C9C9C9]">
                          <span className="truncate max-w-[200px]">{cand.name}</span>
                          <span>{pct}% ({cand.votes.toLocaleString()})</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#151517] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-white to-[#C9C9C9] rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-white/10">
                {elec.userVote ? (
                  <div className="inline-flex items-center space-x-1.5 text-xs text-[#6FCF97] font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Voted: {elec.userVote}</span>
                  </div>
                ) : (
                  <div className="text-xs text-[#8E8E93]">
                    {elec.isActive ? 'Eligible to vote' : 'Voting closed'}
                  </div>
                )}

                {elec.isActive ? (
                  /* Playwright locator requirement: button:has-text("Cast Your Vote") */
                  <button
                    onClick={() => setSelectedElectionForVoting(elec)}
                    className="px-4 py-2 rounded-xl bg-[#F5F5F5] text-[#0B0B0C] font-bold text-xs hover:bg-[#C9C9C9] transition-all flex items-center space-x-1.5 shadow-md"
                  >
                    <span>Cast Your Vote</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                ) : (
                  /* Playwright locator requirement: button[aria-label="View Audit Receipt"] */
                  <button
                    aria-label="View Audit Receipt"
                    onClick={() => navigate('/results')}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F5F5] font-semibold text-xs transition-colors flex items-center space-x-1.5"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#C9C9C9]" />
                    <span>View Audit Receipt</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />

      {/* Voting Modal */}
      {selectedElectionForVoting && (
        <VotingModal
          electionId={selectedElectionForVoting.id}
          candidates={selectedElectionForVoting.candidates}
          onClose={() => setSelectedElectionForVoting(null)}
        />
      )}
    </div>
  );
};
