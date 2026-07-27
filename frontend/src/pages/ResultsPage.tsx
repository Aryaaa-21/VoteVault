import React, { useState } from 'react';
import { useVoteVault } from '../context/VoteVaultContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ShieldCheck, CheckCircle2, FileJson } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { elections } = useVoteVault();
  const pastElection = elections.find((e) => e.id === 'PV-2023-10') || elections[0];

  const [selectedElectionId, setSelectedElectionId] = useState(pastElection.id);
  const currentElection = elections.find((e) => e.id === selectedElectionId) || pastElection;

  const mockTimelineData = [
    { hour: '00:00', votes: 1200 },
    { hour: '04:00', votes: 4500 },
    { hour: '08:00', votes: 12800 },
    { hour: '12:00', votes: 34200 },
    { hour: '16:00', votes: 68900 },
    { hour: '20:00', votes: 120000 }
  ];

  const mockSpentNullifiers = [
    { nullifier: '0x4f92a18b7c3d2e1f9a8b7c6d5e4f3a2b1c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f', block: 1849200, status: 'Verified' },
    { nullifier: '0x8b1f2e3d4c5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c', block: 1849201, status: 'Verified' },
    { nullifier: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', block: 1849202, status: 'Verified' }
  ];

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentElection, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `audit-receipt-${currentElection.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F5] font-body flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 w-full">
        {/* Playwright locator requirement: h1:has-text("Results:") */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="font-heading font-bold text-3xl text-[#F5F5F5]">
              Results: <span className="text-[#6FCF97]">{currentElection.title}</span>
            </h1>
            <p className="text-xs text-[#8E8E93] mt-1 font-mono">
              Referendum ID: {currentElection.id} • Status: {currentElection.outcome || 'Active'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedElectionId}
              onChange={(e) => setSelectedElectionId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#1E1E21] border border-white/10 text-xs font-mono text-[#F5F5F5] focus:outline-none"
            >
              {elections.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.id} - {e.title}
                </option>
              ))}
            </select>

            <button
              onClick={exportJSON}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F5F5] font-semibold text-xs transition-colors flex items-center space-x-2"
            >
              <FileJson className="w-4 h-4 text-[#6FCF97]" />
              <span>Export Audit JSON</span>
            </button>
          </div>
        </div>

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#1E1E21] border border-white/10 space-y-2">
            <div className="text-xs font-mono text-[#8E8E93] uppercase">Total Valid Ballots</div>
            <div className="font-heading font-bold text-3xl text-[#F5F5F5]">{currentElection.totalVotes.toLocaleString()}</div>
            <div className="text-[11px] text-[#6FCF97] flex items-center pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              100% Zero-Knowledge Verified
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#1E1E21] border border-white/10 space-y-2">
            <div className="text-xs font-mono text-[#8E8E93] uppercase">Winning Candidate / Outcome</div>
            <div className="font-heading font-bold text-xl text-[#6FCF97] truncate">
              {currentElection.outcome || currentElection.candidates[0].name}
            </div>
            <div className="text-[11px] text-[#8E8E93]">Determined by consensus tallies</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#1E1E21] border border-white/10 space-y-2">
            <div className="text-xs font-mono text-[#8E8E93] uppercase">Spent Nullifier Registry</div>
            <div className="font-heading font-bold text-3xl text-[#F5F5F5]">{currentElection.totalVotes} Keys</div>
            <div className="text-[11px] text-[#8E8E93] font-mono">No identity correlation</div>
          </div>
        </div>

        {/* Playwright locator requirement: h2:has-text("Participation Timeline") */}
        <div className="p-6 rounded-2xl bg-[#1E1E21] border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl text-[#F5F5F5]">Participation Timeline</h2>
            <span className="text-xs font-mono text-[#8E8E93]">Hourly Ballot Influx Rate</span>
          </div>

          {/* Simple Timeline Bar Visualizer */}
          <div className="grid grid-cols-6 gap-3 items-end h-40 pt-4">
            {mockTimelineData.map((d, idx) => {
              const heightPct = Math.round((d.votes / 120000) * 100);
              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end space-y-2">
                  <div className="text-[10px] font-mono text-[#8E8E93]">{d.votes.toLocaleString()}</div>
                  <div
                    className="w-full bg-gradient-to-t from-white/20 to-white rounded-t-lg transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                  <div className="text-xs font-mono text-[#C9C9C9]">{d.hour}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Playwright locator requirement: h2:has-text("Ledger Proof Verification") */}
        <div className="p-6 rounded-2xl bg-[#1E1E21] border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl text-[#F5F5F5]">Ledger Proof Verification</h2>
            <span className="text-xs font-mono text-[#6FCF97]">On-Chain Nullifier State</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-[#8E8E93]">
                  <th className="pb-3">Spent Nullifier Hash</th>
                  <th className="pb-3">Block Height</th>
                  <th className="pb-3">Cryptographic Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#C9C9C9]">
                {mockSpentNullifiers.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4 truncate max-w-xs text-[#F5F5F5]">{item.nullifier}</td>
                    <td className="py-3 text-[#8E8E93]">{item.block}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center text-[#6FCF97]">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
