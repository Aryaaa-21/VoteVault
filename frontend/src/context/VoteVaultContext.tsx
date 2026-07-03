import React, { createContext, useContext, useState, useEffect } from 'react';
import { VoteVaultContract } from 'votevault-contract';
import { MidnightClient } from './MidnightClient';

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

interface VoteVaultContextType {
  walletConnected: boolean;
  walletAddress: string | null;
  isConnecting: boolean;
  error: string | null;
  elections: Election[];
  connectWallet: (type: 'lace' | 'walletconnect' | 'metamask') => Promise<void>;
  disconnectWallet: () => void;
  castVote: (electionId: string, candidateIndex: number) => Promise<void>;
  createElection: (title: string, description: string, candidates: string[]) => Promise<void>;
  endElectionEarly: (electionId: string) => Promise<void>;
  publishResults: (electionId: string) => Promise<void>;
  clearError: () => void;
}

const VoteVaultContext = createContext<VoteVaultContextType | undefined>(undefined);

// In-memory registry of contract instances for simulation/demonstration
const contractInstances: Record<string, any> = {};

export const VoteVaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletApi, setWalletApi] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial elections state matching Stitch mock datasets
  const [elections, setElections] = useState<Election[]>([
    {
      id: 'VV-2024-NB-01',
      title: 'National Budget 2024',
      description: 'Decide the allocation of the 2024 national reserve funds across key infrastructure projects. This decentralized referendum utilizes quadratic voting principles to ensure fair resource distribution.',
      isActive: true,
      isFinalized: false,
      closesIn: '48h 12m',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVxuj5HJL6XFKeQTv9X8S0_XoNs9q2yO46lzynIWnmPxN71a56My_hWXi820ZMW5vQd11zLRfs8Z-u8Ibrbux3ltYJ99qjl0QyORFqLziwQMQU2_Hc7cWte7fnv4Grk6Zj5n9nnp90ib6ZKhjJVXQ0zpJw8CKBcJq6OYF-dsmz056qHAO98YovdTUgcUL9bcEJ6GzSVERyGH8QqBDW73EHN4yau1tso6zWFq8IU6M4EB1Fa2Vt_u3w',
      candidates: [
        { index: 0, name: 'Option A: Green Infrastructure', votes: 120000, icon: 'eco' },
        { index: 1, name: 'Option B: Defense & Security', votes: 95000, icon: 'security' },
        { index: 2, name: 'Option C: Education & Research', votes: 68000, icon: 'science' }
      ],
      totalVotes: 283000,
      userVote: null
    },
    {
      id: 'VV-102-BD',
      title: 'Community Board Elections',
      description: 'Select the governing representatives for District 09 urban development and environmental oversight committees.',
      isActive: true,
      isFinalized: false,
      closesIn: '5d',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA596a1oqAuA5N8iwxwuW94ppqT9KQoWkr9Gh0EAuNSAmgMUxpc7ZRDopt1Av9bCWT7LbX2BrhZ25swRcdKX3G1nMBHFKoTi9w3b_Ti0xJ0W2UlMbPcaNnejpUnVur8KbisWHIedNHSkJPPxH74J_tA6XcgWMUF0he7CZtacEQyCVY_6QQpjUxHBM4fWyuV4VjpPiAcr-v54gpqEW_TQZe5qIUKnfDCd2jPIAQgaDZzvG8Yy-xZgbo',
      candidates: [
        { index: 0, name: 'Sarah Jenkins (Progressive Urbanism)', votes: 450, icon: 'diversity_3' },
        { index: 1, name: 'Marcus Chen (Green Canopy Initiative)', votes: 620, icon: 'forest' },
        { index: 2, name: 'Elena Rostova (District Commerce Association)', votes: 290, icon: 'storefront' }
      ],
      totalVotes: 1360,
      userVote: null
    },
    {
      id: 'PV-2023-10',
      title: '2023 Protocol Upgrade #10',
      description: 'Upgrade the core zero-knowledge circuit validator configuration for enhanced throughput.',
      isActive: false,
      isFinalized: true,
      closesIn: 'Ended',
      candidates: [
        { index: 0, name: 'AFFIRMATIVE (PASSED)', votes: 1230000, icon: 'check_circle' },
        { index: 1, name: 'NEGATIVE (FAILED)', votes: 270000, icon: 'cancel' }
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
        { index: 0, name: 'In Favor', votes: 850000, icon: 'thumb_up' },
        { index: 1, name: 'Against', votes: 150000, icon: 'thumb_down' }
      ],
      totalVotes: 1000000,
      outcome: 'Passed',
      userVote: 'In Favor'
    }
  ]);

  // Synchronize initial simulated contract state
  useEffect(() => {
    elections.forEach(elec => {
      if (!contractInstances[elec.id]) {
        const contract = new VoteVaultContract();
        contract.initialize(
          'admin-pubkey-0x123',
          elec.id,
          elec.title,
          elec.description
        );
        elec.candidates.forEach(cand => {
          contract.register_candidate('admin-sig', BigInt(cand.index), cand.name);
        });
        contract.open_election('admin-sig');
        elec.candidates.forEach(cand => {
          // Pre-populate votes
          for (let i = 0; i < cand.votes; i += Math.max(1, Math.floor(cand.votes / 100))) {
            contract.cast_vote(`nullifier-init-${cand.index}-${i}`, BigInt(cand.index));
          }
        });
        if (!elec.isActive) {
          contract.close_election('admin-sig');
        }
        if (elec.isFinalized) {
          contract.finalize_election('admin-sig');
        }
        contractInstances[elec.id] = contract;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectWallet = async (type: 'lace' | 'walletconnect' | 'metamask') => {
    setIsConnecting(true);
    setError(null);
    try {
      const client = new MidnightClient();
      if (type === 'lace' && (window as any).midnight?.mnLace) {
        const walletState = await client.connectLaceWallet();
        setWalletAddress(walletState.address);
        setWalletApi(walletState.api);
        setWalletConnected(true);
      } else {
        // Fallback or simulated connection for local testing / other wallets
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate loading delay
        
        let address = '';
        if (type === 'lace') {
          address = '0x89FB-X12-LACE-VOTEVAULT';
        } else if (type === 'metamask') {
          address = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
        } else {
          address = '0xWC-99A1-2C5E-88D2';
        }
        
        setWalletAddress(address);
        setWalletApi(null);
        setWalletConnected(true);
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err?.message || 'Failed to connect wallet. Please ensure Lace extension is running.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    setWalletApi(null);
  };

  const castVote = async (electionId: string, candidateIndex: number) => {
    setError(null);
    if (!walletConnected || !walletAddress) {
      throw new Error("Wallet not connected");
    }

    try {
      const client = new MidnightClient();
      
      // 1. Submit on-chain or compute ZK nullifier locally
      const { nullifier } = await client.castVoteOnChain(electionId, candidateIndex, walletAddress, walletApi);

      // 2. Synchronize local Compact contract state
      let contract = contractInstances[electionId];
      if (!contract) {
        contract = new VoteVaultContract();
        contract.initialize('admin-pubkey-0x123', electionId, 'Election', 'Description');
        contractInstances[electionId] = contract;
      }
      contract.cast_vote(nullifier, BigInt(candidateIndex));

      // 3. Update local React state to reflect vote casting
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
              votedNullifier: nullifier
            };
          }
          return elec;
        })
      );
    } catch (err: any) {
      console.error('Vote submission error:', err);
      setError(err?.message || 'Failed to cast vote. Zero-knowledge proof validation failed.');
      throw err;
    }
  };

  const createElection = async (title: string, description: string, candidateNames: string[]) => {
    setError(null);
    try {
      const client = new MidnightClient();
      const deploymentResult = await client.deployElectionOnChain(title, description, candidateNames, walletAddress || 'admin-pubkey-0x123', walletApi);

      // Instantiate contract locally for simulation tracking
      const contract = new VoteVaultContract();
      contract.initialize(walletAddress || 'admin-pubkey-0x123', deploymentResult.electionId, title, description);
      
      const newCandidates: Candidate[] = candidateNames.map((name, index) => {
        contract.register_candidate('admin-sig', BigInt(index), name);
        let icon = 'how_to_vote';
        if (name.toLowerCase().includes('green') || name.toLowerCase().includes('eco')) icon = 'eco';
        else if (name.toLowerCase().includes('defense') || name.toLowerCase().includes('security')) icon = 'security';
        else if (name.toLowerCase().includes('education') || name.toLowerCase().includes('science')) icon = 'science';
        return { index, name, votes: 0, icon };
      });
      
      contract.open_election('admin-sig');
      contractInstances[deploymentResult.electionId] = contract;

      const newElection: Election = {
        id: deploymentResult.electionId,
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
    } catch (err: any) {
      setError(err?.message || 'Failed to create election.');
      throw err;
    }
  };

  const endElectionEarly = async (electionId: string) => {
    setError(null);
    try {
      const contract = contractInstances[electionId];
      if (contract) {
        contract.close_election('admin-sig');
      }
      setElections((prev) =>
        prev.map((elec) => (elec.id === electionId ? { ...elec, isActive: false } : elec))
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to close election.');
      throw err;
    }
  };

  const publishResults = async (electionId: string) => {
    setError(null);
    try {
      const contract = contractInstances[electionId];
      if (contract) {
        contract.finalize_election('admin-sig');
      }
      setElections((prev) =>
        prev.map((elec) => {
          if (elec.id === electionId) {
            // Find candidate with max votes
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
    } catch (err: any) {
      setError(err?.message || 'Failed to publish results.');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <VoteVaultContext.Provider
      value={{
        walletConnected,
        walletAddress,
        isConnecting,
        error,
        elections,
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
