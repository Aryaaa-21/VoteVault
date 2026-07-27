import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Shield, Cpu, Code2 } from 'lucide-react';

export const DocsPage: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState('architecture');

  const docsMap: Record<string, { title: string; content: string }> = {
    architecture: {
      title: 'System Architecture Specs',
      content: `VoteVault uses a monorepo architecture cleanly separating smart contract logic ('contract/') from frontend user interfaces ('frontend/').

### System Flow
1. User connects Lace Wallet or injected browser provider.
2. Voter selects candidate option in frontend UI.
3. Client enclave derives 32-byte spent nullifier hash N = SHA256(secret || electionId || salt).
4. Witness prover generates ZK-SNARK proof.
5. Transaction payload submitted to Midnight node.`
    },
    privacy: {
      title: 'Privacy & Dual-State Specification',
      content: `The Compact smart contract ('contract/src/index.compact') defines explicit Public Ledger State ('export ledger') and Private Witness Data ('export witness').

- Public Ledger State: admin_pubkey, election_id, election_title, candidate_votes, nullifiers.
- Private Witness Data: voter_credential_secret, nullifier_blinding_secret, private_vote_choice.`
    },
    circuits: {
      title: 'Compact Circuits Overview',
      content: `1. initialize: Open constructor setting referendum metadata.
2. register_candidate: Registers option index and string name.
3. open_election: Activates voting lifecycle.
4. cast_vote: Submits ZK proof and spent nullifier N.
5. close_election: Pauses ballot submissions.
6. finalize_election: Terminal locking of election tallies.`
    }
  };

  const active = docsMap[selectedDoc];

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F5] font-body flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full">
        <div className="border-b border-white/10 pb-6">
          <h1 className="font-heading font-bold text-3xl text-[#F5F5F5]">Documentation Viewer</h1>
          <p className="text-xs text-[#8E8E93] mt-1">Official Midnight developer submission technical documentation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Docs Sidebar */}
          <div className="md:col-span-3 space-y-2">
            <button
              onClick={() => setSelectedDoc('architecture')}
              className={`w-full flex items-center space-x-2 p-3 rounded-xl text-left text-xs font-semibold transition-all ${
                selectedDoc === 'architecture' ? 'bg-[#1E1E21] border border-white/10 text-[#F5F5F5]' : 'text-[#8E8E93] hover:text-[#F5F5F5]'
              }`}
            >
              <Cpu className="w-4 h-4 text-[#6FCF97]" />
              <span>System Architecture</span>
            </button>
            <button
              onClick={() => setSelectedDoc('privacy')}
              className={`w-full flex items-center space-x-2 p-3 rounded-xl text-left text-xs font-semibold transition-all ${
                selectedDoc === 'privacy' ? 'bg-[#1E1E21] border border-white/10 text-[#F5F5F5]' : 'text-[#8E8E93] hover:text-[#F5F5F5]'
              }`}
            >
              <Shield className="w-4 h-4 text-[#F2C94C]" />
              <span>Privacy & Dual-State</span>
            </button>
            <button
              onClick={() => setSelectedDoc('circuits')}
              className={`w-full flex items-center space-x-2 p-3 rounded-xl text-left text-xs font-semibold transition-all ${
                selectedDoc === 'circuits' ? 'bg-[#1E1E21] border border-white/10 text-[#F5F5F5]' : 'text-[#8E8E93] hover:text-[#F5F5F5]'
              }`}
            >
              <Code2 className="w-4 h-4 text-[#C9C9C9]" />
              <span>Circuit Specifications</span>
            </button>
          </div>

          {/* Doc Content Area */}
          <div className="md:col-span-9 p-8 rounded-2xl bg-[#1E1E21] border border-white/10 space-y-6">
            <h2 className="font-heading font-bold text-2xl text-[#F5F5F5]">{active.title}</h2>
            <div className="prose prose-invert max-w-none text-xs leading-relaxed font-body whitespace-pre-line text-[#C9C9C9]">
              {active.content}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
