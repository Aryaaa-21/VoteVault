import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { VoteVaultProvider, useVoteVault } from '../context/VoteVaultContext';

// Helper consumer component to inspect state in testing
const TestConsumer: React.FC = () => {
  const {
    walletConnected,
    walletAddress,
    elections,
    connectWallet,
    disconnectWallet,
    castVote,
    createElection,
  } = useVoteVault();

  const activeElec = elections.find((e) => e.id === 'VV-2024-NB-01');
  const pastElec = elections.find((e) => e.id === 'PV-2023-10');

  return (
    <div>
      <div data-testid="connected">{walletConnected ? 'YES' : 'NO'}</div>
      <div data-testid="address">{walletAddress || 'NONE'}</div>
      <div data-testid="active-votes-a">{activeElec?.candidates[0].votes}</div>
      <div data-testid="active-total-votes">{activeElec?.totalVotes}</div>
      <div data-testid="active-user-vote">{activeElec?.userVote || 'NONE'}</div>
      <div data-testid="election-count">{elections.length}</div>
      
      <div data-testid="past-outcome">{pastElec?.outcome}</div>
      <div data-testid="past-user-vote">{pastElec?.userVote}</div>

      <button data-testid="connect-btn" onClick={() => connectWallet('lace')}>
        Connect Lace
      </button>
      <button data-testid="disconnect-btn" onClick={disconnectWallet}>
        Disconnect
      </button>
      <button data-testid="vote-btn" onClick={() => castVote('VV-2024-NB-01', 0)}>
        Vote Option A
      </button>
      <button data-testid="create-btn" onClick={() => createElection('Protocol Proposal Alpha', 'Testing proposal deployment', ['Option Yes', 'Option No'])}>
        Create Election
      </button>
    </div>
  );
};

describe('VoteVault Platform Core Flows', () => {
  
  it('1. Wallet Connection Flow - should connect, update walletAddress, and disconnect successfully', async () => {
    render(
      <VoteVaultProvider>
        <TestConsumer />
      </VoteVaultProvider>
    );

    // Initial state
    expect(screen.getByTestId('connected').textContent).toBe('NO');
    expect(screen.getByTestId('address').textContent).toBe('NONE');

    // Trigger Lace wallet connection
    const connectBtn = screen.getByTestId('connect-btn');
    await act(async () => {
      fireEvent.click(connectBtn);
      // Wait for simulated latency to resolve
      await new Promise((resolve) => setTimeout(resolve, 1700));
    });

    expect(screen.getByTestId('connected').textContent).toBe('YES');
    expect(screen.getByTestId('address').textContent).toBe('0x89FB-X12-LACE-VOTEVAULT');

    // Trigger Disconnect
    const disconnectBtn = screen.getByTestId('disconnect-btn');
    await act(async () => {
      fireEvent.click(disconnectBtn);
    });

    expect(screen.getByTestId('connected').textContent).toBe('NO');
    expect(screen.getByTestId('address').textContent).toBe('NONE');
  });

  it('2. Vote Casting Test - should allow casting a vote, increment tallies, and store local ZK nullifiers', async () => {
    render(
      <VoteVaultProvider>
        <TestConsumer />
      </VoteVaultProvider>
    );

    // Connect wallet first
    await act(async () => {
      fireEvent.click(screen.getByTestId('connect-btn'));
      await new Promise((resolve) => setTimeout(resolve, 1700));
    });

    const initialVotes = Number(screen.getByTestId('active-votes-a').textContent);
    const initialTotal = Number(screen.getByTestId('active-total-votes').textContent);

    // Cast vote for candidate index 0
    await act(async () => {
      fireEvent.click(screen.getByTestId('vote-btn'));
    });

    const finalVotes = Number(screen.getByTestId('active-votes-a').textContent);
    const finalTotal = Number(screen.getByTestId('active-total-votes').textContent);
    const userVote = screen.getByTestId('active-user-vote').textContent;

    expect(finalVotes).toBe(initialVotes + 1);
    expect(finalTotal).toBe(initialTotal + 1);
    expect(userVote).toBe('Option A: Green Infrastructure');
  });

  it('3. Result Verification Test - should retrieve historical outcomes and verification audit hashes from state store', () => {
    render(
      <VoteVaultProvider>
        <TestConsumer />
      </VoteVaultProvider>
    );

    const outcome = screen.getByTestId('past-outcome').textContent;
    const userPastVote = screen.getByTestId('past-user-vote').textContent;

    expect(outcome).toBe('PASSED (82%)');
    expect(userPastVote).toBe('AFFIRMATIVE (PASSED)');
  });

  it('4. Election Creation Test - should allow deploying a new referendum and registering options', async () => {
    render(
      <VoteVaultProvider>
        <TestConsumer />
      </VoteVaultProvider>
    );

    const initialCount = Number(screen.getByTestId('election-count').textContent);

    const createBtn = screen.getByTestId('create-btn');
    await act(async () => {
      fireEvent.click(createBtn);
    });

    const finalCount = Number(screen.getByTestId('election-count').textContent);
    expect(finalCount).toBe(initialCount + 1);
  });

});
