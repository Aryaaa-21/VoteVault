import { useState, useCallback, useEffect } from 'react';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenDeployTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { VoteVaultContract } from 'votevault-contract'; // Adjusted to use the local monorepo contract
import { useVoteVault } from '../context/VoteVaultContext'; // Adjusted to use existing context
import { Settings, Loader2, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { createConnectedSession, ConnectedSession } from '../lib/midnight';

function getCompiledContract() {
  return CompiledContract.make('VoteVaultContract', VoteVaultContract as any).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(new URL('/managed', window.location.origin).toString()),
  ) as any;
}

export function AdminPage() {
  const { walletConnected, connectWallet } = useVoteVault();
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const [status, setStatus] = useState<'idle' | 'deploying' | 'deployed' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(
    localStorage.getItem('DEPLOYED_CONTRACT_ADDRESS')
  );
  const [copied, setCopied] = useState(false);

  // Initialize session when wallet connects
  useEffect(() => {
    async function initSession() {
      if (walletConnected) {
        try {
          const injectedProvider = (window as any).midnight?.mnLace || (window as any).midnight?.['1am'];
          if (injectedProvider) {
            const api = await injectedProvider.enable();
            const connectedSession = await createConnectedSession(api);
            setSession(connectedSession);
          }
        } catch (e) {
          console.error("Failed to initialize session:", e);
        }
      } else {
        setSession(null);
      }
    }
    initSession();
  }, [walletConnected]);

  const handleDeploy = useCallback(async () => {
    if (!session || !walletConnected) return;
    setStatus('deploying');
    setErrorMsg(null);

    try {
      const compiledContract = getCompiledContract();
      const initialPrivateState = {};

      // Matches initial state args: admin, id, title, description, deadline, merkle_root
      const constructorArgs: any[] = [
        session.unshieldedAddress,
        'ELECTION_1',
        'Admin Deployed Election',
        'Deployed via Admin Page',
        BigInt(Date.now() + 86400000), // closes in 1 day
        'mock_merkle_root'
      ];

      const deployTxData = await createUnprovenDeployTx(session.providers as any, {
        compiledContract,
        args: constructorArgs,
        privateStateId: 'DeployerState',
        initialPrivateState,
        signingKey: sampleSigningKey(),
      });

      const contractAddress = deployTxData.public.contractAddress;

      await submitTxAsync(session.providers as any, {
        unprovenTx: deployTxData.private.unprovenTx,
      });

      setDeployedAddress(contractAddress);
      localStorage.setItem('DEPLOYED_CONTRACT_ADDRESS', contractAddress);
      setStatus('deployed');
    } catch (e: any) {
      console.error('Deployment failed:', e);
      setStatus('error');
      setErrorMsg(e?.message ?? String(e));
    }
  }, [session, walletConnected]);

  const copyAddress = () => {
    if (!deployedAddress) return;
    navigator.clipboard.writeText(deployedAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!walletConnected) {
    return (
      <div className="admin-container p-8 max-w-xl mx-auto text-center mt-20">
        <Settings size={48} className="mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-2">Admin & Deployment Portal</h2>
        <p className="text-gray-400 mb-6">Please connect your 1AM or Lace wallet on the Preview network to deploy.</p>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-lg transition" onClick={() => connectWallet('lace')}>
          Connect Wallet (Preview)
        </button>
      </div>
    );
  }

  return (
    <div className="admin-container p-8 max-w-2xl mx-auto mt-20">
      <h1 className="text-3xl font-bold mb-2 text-white">Contract Deployment</h1>
      <p className="text-gray-400 mb-8">Deploy a new instance of the contract to the Midnight Preview Network.</p>

      <div className="card p-6 border border-gray-700 rounded-xl bg-gray-900/50">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
          <Settings size={20} /> Deployer Panel
        </h2>

        {status === 'idle' || status === 'error' ? (
          <button
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
            onClick={handleDeploy}
          >
            Deploy Contract to Preview
          </button>
        ) : status === 'deploying' ? (
          <button className="w-full py-3 bg-blue-600/50 text-gray-200 font-semibold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed" disabled>
            <Loader2 className="animate-spin" size={20} />
            Deploying... Please approve in your wallet
          </button>
        ) : (
          <div className="p-4 bg-green-900/30 border border-green-500 rounded-lg text-green-300">
            <div className="flex items-center gap-2 font-bold mb-2">
              <CheckCircle size={20} /> Successfully Deployed!
            </div>
            <div className="text-xs font-mono break-all bg-black/40 p-2 rounded flex items-center justify-between gap-2">
              <span>{deployedAddress}</span>
              <button onClick={copyAddress} className="hover:text-white">
                <Copy size={16} />
              </button>
            </div>
            {copied && <span className="text-xs text-green-400 mt-1 block">Copied to clipboard!</span>}
            <a
              href={`https://preview.midnightexplorer.com/contracts/${deployedAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline mt-3"
            >
              View on Midnight Explorer <ExternalLink size={14} />
            </a>
          </div>
        )}

        {status === 'error' && errorMsg && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertCircle size={18} /> Deployment Failed
            </div>
            <p className="text-xs break-words font-mono">{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
