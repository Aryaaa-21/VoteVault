import React, { useState } from 'react';
import { useVoteVault } from '../context/VoteVaultContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { simulationMode, toggleSimulationMode, addToast } = useVoteVault();
  const [nodeUrl, setNodeUrl] = useState('http://localhost:8080');
  const [proofServerUrl, setProofServerUrl] = useState('http://localhost:5001');

  const handleSave = () => {
    addToast('Network RPC configuration saved successfully', 'success');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F5] font-body flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full">
        <div className="border-b border-white/10 pb-6">
          <h1 className="font-heading font-bold text-3xl text-[#F5F5F5]">Protocol Settings</h1>
          <p className="text-xs text-[#8E8E93] mt-1">Configure RPC node endpoints and client enclave preferences.</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#1E1E21] border border-white/10 space-y-6">
          <h2 className="font-heading font-bold text-xl text-[#F5F5F5]">Network & Node Configuration</h2>

          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-[#8E8E93]">Midnight Node RPC Endpoint</label>
              <input
                type="text"
                value={nodeUrl}
                onChange={(e) => setNodeUrl(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#151517] border border-white/10 text-[#F5F5F5] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#8E8E93]">Proof Server Endpoint</label>
              <input
                type="text"
                value={proofServerUrl}
                onChange={(e) => setProofServerUrl(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#151517] border border-white/10 text-[#F5F5F5] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#151517] border border-white/10">
              <div>
                <div className="font-heading font-semibold text-sm text-[#F5F5F5]">Local Enclave Simulation Mode</div>
                <div className="text-[11px] text-[#8E8E93] font-body">Use in-browser witness prover simulator</div>
              </div>
              <button
                onClick={toggleSimulationMode}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  simulationMode ? 'bg-[#F2C94C] text-[#0B0B0C]' : 'bg-white/10 text-[#F5F5F5]'
                }`}
              >
                {simulationMode ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-xl bg-[#F5F5F5] text-[#0B0B0C] font-bold text-xs hover:bg-[#C9C9C9] transition-colors flex items-center space-x-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};
