import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useVoteVault } from '../context/VoteVaultContext';
import { Search, Shield, Vote, BarChart3, Settings, BookOpen, Key, X } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, elections } = useVoteVault();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!commandPaletteOpen) return null;

  const actions = [
    { id: 'dashboard', title: 'Go to Dashboard', path: '/dashboard', icon: Vote },
    { id: 'privacy', title: 'Privacy Model & ZK Enclave', path: '/privacy', icon: Shield },
    { id: 'results', title: 'Ledger Results & Audit Log', path: '/results', icon: BarChart3 },
    { id: 'admin', title: 'Admin Referendum Console', path: '/admin', icon: Key },
    { id: 'dev', title: 'Developer & API Docs', path: '/developer', icon: BookOpen },
    { id: 'settings', title: 'Settings & Key Backup', path: '/settings', icon: Settings },
  ];

  const filteredActions = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredElections = elections.filter((e) =>
    e.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    setCommandPaletteOpen(false);
    navigate(path);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl bg-[#1E1E21] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center px-4 border-b border-white/10">
            <Search className="w-5 h-5 text-[#8E8E93] mr-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search referendums, pages, commands... (Esc to close)"
              className="w-full py-4 bg-transparent text-[#F5F5F5] placeholder-[#8E8E93] focus:outline-none text-sm font-body"
              autoFocus
            />
            <button
              onClick={() => setCommandPaletteOpen(false)}
              className="text-[#8E8E93] hover:text-[#F5F5F5] p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-2 space-y-4">
            {filteredActions.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-xs font-mono text-[#8E8E93] uppercase tracking-wider">
                  Navigation
                </div>
                {filteredActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleSelect(action.path)}
                      className="w-full flex items-center px-3 py-2.5 rounded-lg text-left text-sm text-[#F5F5F5] hover:bg-[#151517] transition-colors"
                    >
                      <Icon className="w-4 h-4 text-[#C9C9C9] mr-3" />
                      {action.title}
                    </button>
                  );
                })}
              </div>
            )}

            {filteredElections.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-xs font-mono text-[#8E8E93] uppercase tracking-wider">
                  Active Referendums
                </div>
                {filteredElections.map((elec) => (
                  <button
                    key={elec.id}
                    onClick={() => handleSelect(`/election/${elec.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm text-[#F5F5F5] hover:bg-[#151517] transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Vote className="w-4 h-4 text-[#6FCF97]" />
                      <span className="truncate">{elec.title}</span>
                    </div>
                    <span className="text-xs font-mono text-[#8E8E93]">{elec.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-2 bg-[#151517] border-t border-white/10 flex items-center justify-between text-xs text-[#8E8E93] font-mono">
            <span>Navigation: <kbd className="px-1.5 py-0.5 bg-[#0B0B0C] rounded border border-white/10">↑↓</kbd></span>
            <span>Select: <kbd className="px-1.5 py-0.5 bg-[#0B0B0C] rounded border border-white/10">Enter</kbd></span>
            <span>Close: <kbd className="px-1.5 py-0.5 bg-[#0B0B0C] rounded border border-white/10">Esc</kbd></span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
