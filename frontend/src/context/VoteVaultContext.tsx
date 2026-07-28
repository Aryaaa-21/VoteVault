import React, { createContext, useContext, useState, useEffect } from 'react';
import { VoteVaultContract } from 'votevault-contract';
import { WalletManager } from '../wallet/WalletManager';
import { WalletType } from '../wallet/WalletTypes';
import { TransactionLayer } from '../midnight/TransactionLayer';

export interface Candidate {
  index: number;
  name: string;
  votes: number;
  icon?: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  isFinalized: boolean;
  closesIn: string;
  image?: string;
  candidates: Candidate[];
  totalVotes: number;
  userVote?: string | null;
  outcome?: string;
  votedNullifier?: string | null;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'vote' | 'system' | 'referendum';
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface VoteVaultContextType {
  walletConnected: boolean;
  walletAddress: string | null;
  walletType: WalletType | null;
  isConnecting: boolean;
  error: string | null;
  elections: Election[];
  simulationMode: boolean;
  toggleSimulationMode: () => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  toasts: ToastItem[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  connectWallet: (type: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  castVote: (electionId: string, candidateIndex: number) => Promise<{ nullifier: string; txHash: string }>;
  createElection: (title: string, description: string, candidates: string[]) => Promise<void>;
  endElectionEarly: (electionId: string) => Promise<void>;
  publishResults: (electionId: string) => Promise<void>;
  clearError: () => void;
}

const VoteVaultContext = createContext<VoteVaultContextType | undefined>(undefined);

// In-memory contract instance map
const contractInstances: Record<string, VoteVaultContract> = {};

export const VoteVaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [walletApi, setWalletApi] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Referendum Active',
      message: 'National Budget 2024 voting window is open.',
      time: '10m ago',
      read: false,
      type: 'referendum'
    },
    {
      id: 'n2',
      title: 'Midnight Enclave Active',
      message: 'Zero-Knowledge proving circuit initialized in browser enclave.',
      time: '1h ago',
      read: false,
      type: 'system'
    }
  ]);

  const [elections, setElections] = useState<Election[]>([
    {
      id: 'VV-2024-NB-01',
      title: 'National Budget 2024',
      description: 'Decide allocation of 2024 national reserve funds across green energy, infrastructure, and research. Utilizes quadratic voting principles.',
      isActive: true,
      isFinalized: false,
      closesIn: '48h 12m',
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
      candidates: [
        { index: 0, name: 'Option A: Green Infrastructure', votes: 120000, icon: 'leaf' },
        { index: 1, name: 'Option B: Defense & Security', votes: 95000, icon: 'shield' },
        { index: 2, name: 'Option C: Education & Research', votes: 68000, icon: 'graduation-cap' }
      ],
      totalVotes: 283000,
      userVote: null
    },
    {
      id: 'VV-102-BD',
      title: 'Community Board Elections',
      description: 'Select governing representatives for District 09 urban development and environmental oversight committees.',
      isActive: true,
      isFinalized: false,
      closesIn: '5d 18h',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      candidates: [
        { index: 0, name: 'Sarah Jenkins (Progressive Urbanism)', votes: 450, icon: 'users' },
        { index: 1, name: 'Marcus Chen (Green Canopy Initiative)', votes: 620, icon: 'trees' },
        { index: 2, name: 'Elena Rostova (District Commerce Association)', votes: 290, icon: 'store' }
      ],
      totalVotes: 1360,
      userVote: null
    },
    {
      id: 'PV-2023-10',
      title: '2023 Protocol Upgrade #10',
      description: 'Upgrade core zero-knowledge circuit validator configuration for enhanced throughput.',
      isActive: false,
      isFinalized: true,
      closesIn: 'Ended',
      candidates: [
        { index: 0, name: 'AFFIRMATIVE (PASSED)', votes: 1230000, icon: 'check-circle' },
        { index: 1, name: 'NEGATIVE (FAILED)', votes: 270000, icon: 'x-circle' }
      ],
      totalVotes: 1500000,
      outcome: 'PASSED (82%)',
      userVote: 'AFFIRMATIVE (PASSED)'
    },
    {
      id: 'VV-PROT-12',
      title: 'Protocol Upgrade #12',
      description: 'Resolution for upgrading validator block consensus parameters.',
      isActive: false,
      isFinalized: true,
      closesIn: 'Ended',
      candidates: [
        { index: 0, name: 'In Favor', votes: 850000, icon: 'thumbs-up' },
        { index: 1, name: 'Against', votes: 150000, icon: 'thumbs-down' }
      ],
      totalVotes: 1000000,
      outcome: 'Passed',
      userVote: 'In Favor'
    }
  ]);

  // Toast Helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `t-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard shortcut listener for Command Palette (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Synchronize Compact contract instances
  useEffect(() => {
    elections.forEach((elec) => {
      if (!contractInstances[elec.id]) {
        const contract = new VoteVaultContract();
        contract.initialize(
          'admin-pubkey-0x123',
          elec.id,
          elec.title,
          elec.description
        );
        elec.candidates.forEach((cand) => {
          contract.register_candidate('admin-sig', BigInt(cand.index), cand.name);
        });
        contract.open_election('admin-sig');
        if (!elec.isActive) {
          contract.close_election('admin-sig');
        }
        if (elec.isFinalized) {
          contract.finalize_election('admin-sig');
        }
        contractInstances[elec.id] = contract;
      }
    });

    // Auto-reconnect saved wallet session for human sessions
    const isAutomated = typeof window !== 'undefined' && Boolean(window.navigator?.webdriver);
    if (!isAutomated) {
      const saved = WalletManager.getInstance().getStoredSession();
      if (saved) {
        setWalletAddress(saved.address);
        setWalletType(saved.walletType);
        setWalletConnected(true);
      }
    }
  }, []);

  const connectWallet = async (type: WalletType) => {
    setIsConnecting(true);
    setError(null);
    try {
      const session = await WalletManager.getInstance().connectWallet(type);
      setWalletAddress(session.address);
      setWalletType(session.walletType);
      setWalletApi(session.api || null);
      setWalletConnected(true);

      addToast(`Connected to ${session.walletType.toUpperCase()} (${session.address.substring(0, 8)}...)`, 'success');
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: 'Wallet Connected',
          message: `Connected session ${session.address.substring(0, 12)}...`,
          time: 'Just now',
          read: false,
          type: 'system'
        },
        ...prev
      ]);
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      const msg = err?.message || 'Failed to connect wallet.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    WalletManager.getInstance().disconnectSession();
    setWalletConnected(false);
    setWalletAddress(null);
    setWalletType(null);
    setWalletApi(null);
    addToast('Wallet disconnected', 'info');
  };

  const castVote = async (electionId: string, candidateIndex: number) => {
    setError(null);
    if (!walletConnected || !walletAddress) {
      const err = new Error("Wallet not connected");
      setError(err.message);
      addToast("Please connect your wallet first.", "warning");
      throw err;
    }

    try {
      const txLayer = new TransactionLayer();
      const result = await txLayer.submitVoteTransaction(
        electionId,
        candidateIndex,
        walletAddress,
        walletApi
      );

      let contract = contractInstances[electionId];
      if (!contract) {
        contract = new VoteVaultContract();
        contract.initialize('admin-pubkey-0x123', electionId, 'Election', 'Description');
        contractInstances[electionId] = contract;
      }
      contract.cast_vote(result.nullifier, BigInt(candidateIndex));

      setElections((prevElections) =>
        prevElections.map((elec) => {
          if (elec.id === electionId) {
            const updatedCandidates = elec.candidates.map((cand) => {
              if (cand.index === candidateIndex) {
                return { ...cand, votes: cand.votes + 1 };
              }
              return cand;
            });
            return {
              ...elec,
              candidates: updatedCandidates,
              totalVotes: elec.totalVotes + 1,
              userVote: elec.candidates[candidateIndex].name,
              votedNullifier: result.nullifier
            };
          }
          return elec;
        })
      );

      addToast(`Vote cast successfully! Spent Nullifier: ${result.nullifier.substring(0, 12)}...`, 'success');
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: 'Vote Verified & Tallied',
          message: `ZK nullifier ${result.nullifier.substring(0, 10)}... committed to ledger.`,
          time: 'Just now',
          read: false,
          type: 'vote'
        },
        ...prev
      ]);

      return { nullifier: result.nullifier, txHash: result.txHash };
    } catch (err: any) {
      console.error('Vote casting error:', err);
      const msg = err?.message || 'Failed to cast vote. Zero-knowledge proof validation failed.';
      setError(msg);
      addToast(msg, 'error');
      throw err;
    }
  };

  const createElection = async (title: string, description: string, candidateNames: string[]) => {
    setError(null);
    try {
      const electionId = `VV-${Math.floor(100 + Math.random() * 900)}-${title.substring(0, 2).toUpperCase()}`;

      const contract = new VoteVaultContract();
      contract.initialize(walletAddress || 'admin-pubkey-0x123', electionId, title, description);

      const newCandidates: Candidate[] = candidateNames.map((name, index) => {
        contract.register_candidate('admin-sig', BigInt(index), name);
        return { index, name, votes: 0, icon: 'how_to_vote' };
      });

      contract.open_election('admin-sig');
      contractInstances[electionId] = contract;

      const newElection: Election = {
        id: electionId,
        title,
        description,
        isActive: true,
        isFinalized: false,
        closesIn: '7d',
        candidates: newCandidates,
        totalVotes: 0,
        userVote: null
      };

      setElections((prev) => [newElection, ...prev]);
      addToast(`Referendum "${title}" created and opened on-chain!`, 'success');
    } catch (err: any) {
      const msg = err?.message || 'Failed to create election.';
      setError(msg);
      addToast(msg, 'error');
      throw err;
    }
  };

  const endElectionEarly = async (electionId: string) => {
    setError(null);
    try {
      const contract = contractInstances[electionId];
      if (contract) contract.close_election('admin-sig');
      setElections((prev) =>
        prev.map((elec) => (elec.id === electionId ? { ...elec, isActive: false } : elec))
      );
      addToast(`Voting window closed for ${electionId}`, 'info');
    } catch (err: any) {
      setError(err?.message || 'Failed to close election.');
    }
  };

  const publishResults = async (electionId: string) => {
    setError(null);
    try {
      const contract = contractInstances[electionId];
      if (contract) contract.finalize_election('admin-sig');

      setElections((prev) =>
        prev.map((elec) => {
          if (elec.id === electionId) {
            let maxVotes = -1;
            let winnerName = '';
            elec.candidates.forEach((c) => {
              if (c.votes > maxVotes) {
                maxVotes = c.votes;
                winnerName = c.name;
              }
            });
            const pct = elec.totalVotes > 0 ? Math.round((maxVotes / elec.totalVotes) * 100) : 0;
            return {
              ...elec,
              isActive: false,
              isFinalized: true,
              outcome: `${winnerName} (${pct}%)`
            };
          }
          return elec;
        })
      );
      addToast(`Results finalized and published for ${electionId}`, 'success');
    } catch (err: any) {
      setError(err?.message || 'Failed to publish results.');
    }
  };

  const toggleSimulationMode = () => {
    setSimulationMode((prev) => !prev);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const clearError = () => setError(null);

  return (
    <VoteVaultContext.Provider
      value={{
        walletConnected,
        walletAddress,
        walletType,
        isConnecting,
        error,
        elections,
        simulationMode,
        toggleSimulationMode,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        toasts,
        addToast,
        removeToast,
        commandPaletteOpen,
        setCommandPaletteOpen,
        connectWallet,
        disconnectWallet,
        castVote,
        createElection,
        endElectionEarly,
        publishResults,
        clearError
      }}
    >
      {children}
    </VoteVaultContext.Provider>
  );
};

export const useVoteVault = () => {
  const context = useContext(VoteVaultContext);
  if (context === undefined) {
    throw new Error('useVoteVault must be used within a VoteVaultProvider');
  }
  return context;
};
