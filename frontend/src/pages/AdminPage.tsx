import { useCallback, useEffect, useMemo, useState } from 'react';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenCallTx, createUnprovenDeployTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { Check, Copy, ExternalLink, KeyRound, LoaderCircle, Pause, Play, RefreshCw, Settings2, ShieldCheck, WalletCards } from 'lucide-react';
import { Contract, pureCircuits } from '../managed/contract/index.js';
import { useWallet } from '../contexts/WalletContext';
import { DEFAULT_SIGNAL_THRESHOLD, DEFAULT_VISITOR_LIMIT, getContractAddress, getExplorerContractUrl, getNetwork, getNetworkConfig, setContractAddress, type Network } from '../config';
import { fromHex, isSuccessfulIndexedTx, randomSecretHex, toHex, validateSecretHex, waitForIndexedTx } from '../lib/midnight';
import { preflightArtifacts, parseTransactionId, validateUint } from '../lib/transactions';
import { useContractState } from '../hooks/useContractState';

const PRIVATE_STATE_ID = 'VoteVaultOperatorState';
const CIRCUIT_IDS = ['register_credential', 'claim_pass', 'retune_room', 'seal_room', 'unseal_room'] as const;

type ActionStatus = { kind: 'idle' | 'working' | 'submitted' | 'indexed' | 'error'; message: string; txId?: string };

function getCompiledContract(secret: Uint8Array) {
  const witnesses = {
    get_private_signal: (ctx: any) => [ctx.privateState, 0n],
    get_room_secret: (ctx: any) => [ctx.privateState, new Uint8Array(32)],
    operator_secret: (ctx: any) => [ctx.privateState, secret],
    find_credential_path: (ctx: any, commitment: Uint8Array) => {
      const path = ctx.ledger.authorized_credentials.findPathForLeaf(commitment);
      if (!path) throw new Error('No Merkle path exists for this credential in the current public state.');
      return [ctx.privateState, path];
    },
  };
  return CompiledContract.make('VoteVault', Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(new URL('/managed', window.location.origin).toString()),
  ) as any;
}

function ensurePrivateState(session: any, address: string) {
  session.providers.privateStateProvider.setContractAddress(address);
  return session.providers.privateStateProvider.get(PRIVATE_STATE_ID).then((value: unknown) => {
    if (value === null) return session.providers.privateStateProvider.set(PRIVATE_STATE_ID, {});
    return undefined;
  });
}

export default function AdminPage() {
  const { session, isConnected, connect, isConnecting, walletStatus, network } = useWallet();
  const selectedNetwork = network || getNetwork();
  const [secret, setSecret] = useState(() => randomSecretHex());
  const [secretDraft, setSecretDraft] = useState('');
  const [backupAcknowledged, setBackupAcknowledged] = useState(false);
  const [threshold, setThreshold] = useState(DEFAULT_SIGNAL_THRESHOLD.toString());
  const [limit, setLimit] = useState(DEFAULT_VISITOR_LIMIT.toString());
  const [expiryDays, setExpiryDays] = useState('30');
  const [credential, setCredential] = useState('');
  const [status, setStatus] = useState<ActionStatus>({ kind: 'idle', message: '' });
  const [activeAddress, setActiveAddress] = useState(getContractAddress(selectedNetwork));
  const { ledgerState, isLoading, refetch } = useContractState(4000, activeAddress);
  useEffect(() => setActiveAddress(getContractAddress(selectedNetwork)), [selectedNetwork]);
  const operatorCommitment = useMemo(() => {
    try { return toHex((pureCircuits as any).operator_key(fromHex(secret))); } catch { return ''; }
  }, [secret]);

  const importSecret = () => {
    if (!backupAcknowledged) {
      setStatus({ kind: 'error', message: 'Acknowledge that this import contains the operator secret first.' });
      return;
    }
    try {
      setSecret(validateSecretHex(secretDraft));
      setSecretDraft('');
      setStatus({ kind: 'indexed', message: 'Operator secret imported into memory for this tab only.' });
    } catch (cause: any) { setStatus({ kind: 'error', message: cause?.message || String(cause) }); }
  };

  const backupSecret = async () => {
    if (!backupAcknowledged) {
      setStatus({ kind: 'error', message: 'Acknowledge that this backup contains the operator secret first.' });
      return;
    }
    try {
      await navigator.clipboard.writeText(secret);
      setStatus({ kind: 'indexed', message: 'Operator secret copied for your acknowledged backup. Store it in a secure password manager.' });
    } catch { setStatus({ kind: 'error', message: 'Clipboard access was denied. Reveal the value only in a trusted environment and back it up securely.' }); }
  };

  const deploy = useCallback(async () => {
    if (!session) { setStatus({ kind: 'error', message: `Connect a wallet to ${selectedNetwork} before deploying.` }); return; }
    try {
      const minimum = validateUint(threshold, 'Minimum signal', { min: 1n });
      const visitorLimit = validateUint(limit, 'Visitor capacity', { min: 1n, max: 1024n });
      const days = validateUint(expiryDays, 'Expiry days', { min: 1n, max: 3650n });
      setStatus({ kind: 'working', message: 'Checking compiled VoteVault artifacts before building the deployment…' });
      await preflightArtifacts(window.fetch.bind(window), new URL('/managed/', window.location.origin).toString(), CIRCUIT_IDS);
      const salt = crypto.getRandomValues(new Uint8Array(32));
      const issuer = crypto.getRandomValues(new Uint8Array(32));
      const expiry = BigInt(Math.floor(Date.now() / 1000)) + days * 86_400n;
      const data = await createUnprovenDeployTx(session.providers as any, {
        compiledContract: getCompiledContract(fromHex(secret)),
        initialPrivateState: {},
        args: [minimum, salt, expiry, issuer, fromHex(operatorCommitment), visitorLimit],
        signingKey: sampleSigningKey(),
      } as any);
      const address = data.public.contractAddress;
      setStatus({ kind: 'working', message: 'Proof prepared. Asking the connected wallet to balance and submit the deployment…' });
      const txId = parseTransactionId(await submitTxAsync(session.providers as any, { unprovenTx: data.private.unprovenTx } as any));
      setContractAddress(address, selectedNetwork);
      setActiveAddress(address);
      await ensurePrivateState(session, address);
      setStatus({ kind: 'submitted', message: `Deployment submitted to ${selectedNetwork}. Waiting for the indexer; submission is not confirmation.`, txId });
      const confirmation = await waitForIndexedTx(session.providers.publicDataProvider, txId);
      if (confirmation.indexed && isSuccessfulIndexedTx(confirmation.data)) {
        setStatus({ kind: 'indexed', message: `Deployment indexed successfully on ${selectedNetwork}. Verify the public state before sharing this address.`, txId });
        void refetch();
      } else if (confirmation.indexed) {
        setStatus({ kind: 'error', message: `Deployment was indexed but did not succeed (${confirmation.data?.status || 'unknown status'}). Do not use this contract address.`, txId });
      } else {
        setStatus({ kind: 'submitted', message: `Deployment submitted as ${txId}, but the indexer did not confirm it before timeout. Do not claim deployment success yet.`, txId });
      }
    } catch (cause: any) {
      setStatus({ kind: 'error', message: cause?.message || String(cause) });
    }
  }, [expiryDays, limit, operatorCommitment, refetch, secret, selectedNetwork, session, threshold]);

  const callOperatorCircuit = useCallback(async (circuitId: string, args: unknown[] = [], label = circuitId) => {
    if (!session || !activeAddress) { setStatus({ kind: 'error', message: 'Connect the operator wallet and select a deployed contract first.' }); return; }
    try {
      await ensurePrivateState(session, activeAddress);
      setStatus({ kind: 'working', message: `Building the ${label} proof…` });
      const data = await createUnprovenCallTx(session.providers as any, {
        compiledContract: getCompiledContract(fromHex(secret)),
        contractAddress: activeAddress,
        privateStateId: PRIVATE_STATE_ID,
        circuitId,
        ...(args.length ? { args } : {}),
      } as any);
      const txId = parseTransactionId(await submitTxAsync(session.providers as any, { unprovenTx: data.private.unprovenTx, circuitId } as any));
      setStatus({ kind: 'submitted', message: `${label} submitted. Waiting for indexed confirmation; a wallet acceptance alone is not success.`, txId });
      const confirmation = await waitForIndexedTx(session.providers.publicDataProvider, txId);
      if (confirmation.indexed && isSuccessfulIndexedTx(confirmation.data)) {
        setStatus({ kind: 'indexed', message: `${label} is indexed successfully on ${selectedNetwork}.`, txId });
        void refetch();
      } else if (confirmation.indexed) {
        setStatus({ kind: 'error', message: `${label} was indexed but did not succeed (${confirmation.data?.status || 'unknown status'}).`, txId });
      } else {
        setStatus({ kind: 'submitted', message: `${label} was submitted as ${txId}, but the indexer did not confirm it before timeout.`, txId });
      }
    } catch (cause: any) { setStatus({ kind: 'error', message: cause?.message || String(cause) }); }
  }, [activeAddress, refetch, secret, selectedNetwork, session]);

  const registerCredential = () => {
    try {
      const normalized = validateSecretHex(credential);
      void callOperatorCircuit('register_credential', [fromHex(normalized)], 'Credential registration');
    } catch (cause: any) { setStatus({ kind: 'error', message: cause?.message || String(cause) }); }
  };

  const retune = () => {
    try {
      if (!ledgerState) throw new Error('Read the active room before retuning it.');
      const nextMinimum = validateUint(threshold, 'Minimum signal', { min: 1n });
      const nextLimit = validateUint(limit, 'Visitor capacity', { min: ledgerState.verified_visitors ?? 0n, max: 1024n });
      const expiry = BigInt(Math.floor(Date.now() / 1000)) + validateUint(expiryDays, 'Expiry days', { min: 1n }) * 86_400n;
      void callOperatorCircuit('retune_room', [nextMinimum, ledgerState.room_salt, expiry, ledgerState.issuer_id, nextLimit], 'Room retune');
    } catch (cause: any) { setStatus({ kind: 'error', message: cause?.message || String(cause) }); }
  };

  return <div className="page">
    <div className="page-heading"><div className="section-kicker">Studio / operator tools</div><h1>Shape the room.<br /><em>Keep the key offline.</em></h1><p>Deploy and operate a VoteVault allowlist room on {selectedNetwork}. The operator secret is held in memory only; the wallet proves control and the indexer is the source of confirmation.</p></div>
    <div className="content-grid">
      <section className="panel"><div className="section-kicker">Browser deployment</div><h2>New VoteVault room</h2><p>Compiled artifacts are checked before a transaction is built. The constructor order is minimum, salt, expiry, issuer, operator commitment, then capacity.</p>
        <div className="field"><label htmlFor="operator-secret">Operator secret · memory only</label><input id="operator-secret" className="input mono" type="password" value={secret} readOnly aria-describedby="operator-secret-help" /><small id="operator-secret-help">Never store this in localStorage or send it as a circuit argument.</small></div>
        <div className="field"><label htmlFor="operator-import">Import acknowledged backup</label><div className="copy-line"><input id="operator-import" className="input mono" value={secretDraft} onChange={(event) => setSecretDraft(event.target.value)} placeholder="64 hex characters" /><button className="tiny-button" onClick={importSecret}>Import</button></div></div>
        <label className="field"><span><input type="checkbox" checked={backupAcknowledged} onChange={(event) => setBackupAcknowledged(event.target.checked)} /> I understand this backup can authorize operator actions.</span></label>
        <button className="button subtle" onClick={() => void backupSecret()}><Copy size={15} />Copy acknowledged backup</button>
        <div className="notice"><KeyRound size={15} style={{ color: 'var(--brand)', flexShrink: 0 }} />Operator commitment <span className="mono">{operatorCommitment.slice(0, 18)}…</span> is public; the secret is not.</div>
        <div className="form-grid"><div className="field"><label htmlFor="threshold">Minimum signal</label><input id="threshold" className="input mono" type="number" min="1" value={threshold} onChange={(event) => setThreshold(event.target.value)} /></div><div className="field"><label htmlFor="limit">Visitor capacity (max 1024)</label><input id="limit" className="input mono" type="number" min="1" max="1024" value={limit} onChange={(event) => setLimit(event.target.value)} /></div><div className="field"><label htmlFor="expiry-days">Expiry in days</label><input id="expiry-days" className="input mono" type="number" min="1" value={expiryDays} onChange={(event) => setExpiryDays(event.target.value)} /></div></div>
        {!isConnected && <button className="button" style={{ width: '100%', marginTop: 16 }} onClick={() => void connect(selectedNetwork)} disabled={isConnecting || walletStatus === 'not-found'}><WalletCards size={15} />{isConnecting ? 'Opening wallet…' : `Connect wallet on ${selectedNetwork}`}</button>}
        <button className="button primary" style={{ width: '100%', marginTop: 10 }} onClick={() => void deploy()} disabled={!isConnected || status.kind === 'working'}><Settings2 size={15} />{status.kind === 'working' ? 'Working…' : `Deploy to ${selectedNetwork}`}</button>
        {status.message && <div className={`notice ${status.kind === 'error' ? 'error' : status.kind === 'indexed' ? 'success' : ''}`} style={{ marginTop: 16, wordBreak: 'break-word' }} role={status.kind === 'error' ? 'alert' : 'status'}><ShieldCheck size={15} style={{ flexShrink: 0 }} /><span>{status.message}{status.txId && <><br /><span className="mono">Submitted tx: {status.txId}</span>{activeAddress && <><br /><button className="tiny-button" onClick={() => void navigator.clipboard.writeText(activeAddress)}><Copy size={13} />Copy contract address</button></>}</>}</span></div>}
      </section>
      <section className="panel"><div className="panel-head"><div className="section-kicker">Active room / {selectedNetwork}</div><button className="tiny-button" onClick={() => void refetch()} aria-label="Refresh active room"><RefreshCw size={14} /></button></div>
        {isLoading ? <div className="empty-state" style={{ marginTop: 20 }}>Reading public state…</div> : !ledgerState ? <div className="empty-state" style={{ marginTop: 20 }}>Nothing indexed at <span className="mono">{activeAddress || '—'}</span>.</div> : <><div className="data-list"><div className="data-row"><span className="data-label">Status</span><span className={`status-badge ${ledgerState.room_live ? '' : 'closed'}`}><span>●</span>{ledgerState.room_live ? 'open' : 'sealed'}</span></div><div className="data-row"><span className="data-label">Minimum signal</span><strong>{ledgerState.minimum_signal?.toString()} points</strong></div><div className="data-row"><span className="data-label">Operator commitment</span><strong className="mono">{toHex(ledgerState.operator_commitment).slice(0, 18)}…</strong></div><div className="data-row"><span className="data-label">Visitors</span><strong>{ledgerState.verified_visitors?.toString()} / {ledgerState.visitor_limit?.toString()}</strong></div></div><div className="field" style={{ marginTop: 18 }}><label htmlFor="credential">Credential commitment to enroll</label><div className="copy-line"><input id="credential" className="input mono" value={credential} onChange={(event) => setCredential(event.target.value)} placeholder="32-byte commitment, 64 hex" /><button className="tiny-button" onClick={registerCredential} disabled={!isConnected || status.kind === 'working'}>Register</button></div></div><div className="form-grid"><button className="button" onClick={retune} disabled={!isConnected || status.kind === 'working'}><Settings2 size={15} />Retune</button><button className="button" onClick={() => void callOperatorCircuit(ledgerState.room_live ? 'seal_room' : 'unseal_room', [], ledgerState.room_live ? 'Seal room' : 'Open room')} disabled={!isConnected || status.kind === 'working'}>{ledgerState.room_live ? <><Pause size={15} />Seal room</> : <><Play size={15} />Open room</>}</button></div><a className="button subtle" style={{ width: '100%', marginTop: 10 }} href={getExplorerContractUrl(activeAddress, selectedNetwork)} target="_blank" rel="noreferrer"><ExternalLink size={15} />View contract on explorer</a></>}
      </section>
    </div>
    <section className="panel" style={{ marginTop: 15 }}><div className="section-kicker">Operator checklist</div><div className="route-strip" style={{ marginTop: 18 }}><div className="route-card"><small>01</small><strong>Preflight</strong><span className="tiny-button">all VoteVault ZK artifacts</span></div><div className="route-card"><small>02</small><strong>Submit</strong><span className="tiny-button">wallet balancing + proving</span></div><div className="route-card"><small>03</small><strong>Index</strong><span className="tiny-button">confirmation is separate</span></div><div className="route-card"><small>04</small><strong>Enroll</strong><span className="tiny-button">register commitments only</span></div></div></section>
  </div>;
}
