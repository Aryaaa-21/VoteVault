import { useCallback, useEffect, useMemo, useState } from 'react';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenCallTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { ArrowRight, CheckCircle2, Download, EyeOff, KeyRound, LockKeyhole, RefreshCw, ShieldCheck, Upload, WalletCards } from 'lucide-react';
import { Contract, pureCircuits } from '../managed/contract/index.js';
import { useWallet } from '../contexts/WalletContext';
import { getContractAddress, getExplorerTxUrl, getNetwork } from '../config';
import { fromHex, toHex, validateSecretHex, waitForIndexedTx } from '../lib/midnight';
import { credentialCommitment, exportIdentity, getIdentity, createIdentity, importIdentity, hasUsedCredential, type PrivateIdentity } from '../lib/identity';
import { parseTransactionId, validateUint } from '../lib/transactions';
import { useContractState } from '../hooks/useContractState';

const PRIVATE_STATE_ID = 'VoteVaultVisitorState';

type ClaimStatus = 'ready' | 'proving' | 'submitted' | 'indexed' | 'error';

function compiled(signal: bigint, secret: Uint8Array) {
  const witnesses = {
    get_private_signal: (ctx: any) => [ctx.privateState, signal],
    get_room_secret: (ctx: any) => [ctx.privateState, secret],
    operator_secret: (ctx: any) => [ctx.privateState, new Uint8Array(32)],
    find_credential_path: (ctx: any, commitment: Uint8Array) => {
      const path = ctx.ledger.authorized_credentials.findPathForLeaf(commitment);
      if (!path) throw new Error('This credential is not present in the current authorized Merkle tree. Ask the operator to enroll this commitment.');
      return [ctx.privateState, path];
    },
  };
  return CompiledContract.make('VoteVault', Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(new URL('/managed', window.location.origin).toString()),
  ) as any;
}

function parseSignal(value: string): bigint {
  return validateUint(value, 'Private score', { min: 0n, max: 18_446_744_073_709_551_615n });
}

export default function GatePage() {
  const { session, isConnected, connect, isConnecting, walletStatus, network } = useWallet();
  const selectedNetwork = network || getNetwork();
  const { ledgerState, isLoading, error, refetch } = useContractState(4000);
  const [identity, setIdentity] = useState<PrivateIdentity | null>(() => getIdentity());
  const [signal, setSignal] = useState('88');
  const [importDraft, setImportDraft] = useState('');
  const [backupAcknowledged, setBackupAcknowledged] = useState(false);
  const [status, setStatus] = useState<ClaimStatus>('ready');
  const [message, setMessage] = useState('');
  const [txId, setTxId] = useState('');
  const address = getContractAddress(selectedNetwork);
  const signalValue = useMemo(() => { try { return parseSignal(signal); } catch { return -1n; } }, [signal]);
  const threshold = BigInt(ledgerState?.minimum_signal ?? 0);
  const commitment = useMemo(() => {
    if (!identity || !ledgerState?.room_salt || signalValue < 0n) return '';
    try { return toHex(credentialCommitment(signalValue, identity.secret, ledgerState.room_salt)); } catch { return ''; }
  }, [identity, ledgerState, signalValue]);
  const hasUsed = useMemo(() => identity ? hasUsedCredential(identity.secret, ledgerState) : false, [identity, ledgerState]);
  const pathAvailable = useMemo(() => {
    if (!commitment || !ledgerState?.authorized_credentials?.findPathForLeaf) return false;
    try { return Boolean(ledgerState.authorized_credentials.findPathForLeaf(fromHex(commitment))); } catch { return false; }
  }, [commitment, ledgerState]);
  const isReady = Boolean(identity && address && ledgerState?.room_live && signalValue >= threshold && !hasUsed && pathAvailable && isConnected && signalValue >= 0n);

  useEffect(() => { setStatus('ready'); setMessage(''); setTxId(''); }, [address, identity?.secret, selectedNetwork]);

  const generate = () => { setIdentity(createIdentity()); setMessage('New 32-byte secret generated in memory. Back it up explicitly if you need to return later.'); };
  const importSecret = () => {
    try { setIdentity(importIdentity(importDraft, backupAcknowledged)); setImportDraft(''); setMessage('Imported secret is held in memory for this tab only.'); }
    catch (cause: any) { setStatus('error'); setMessage(cause?.message || String(cause)); }
  };
  const exportSecret = async () => {
    try {
      const value = exportIdentity(identity, backupAcknowledged);
      await navigator.clipboard.writeText(value);
      setMessage('Acknowledged private backup copied. Store it in a secure password manager; VoteVault does not save it.');
    } catch (cause: any) { setStatus('error'); setMessage(cause?.message || String(cause)); }
  };

  const claim = useCallback(async () => {
    if (!identity) return setMessage('Generate or import a 32-byte private secret first.');
    if (!ledgerState || !address) return setMessage('No indexed room is configured on this network. Ask an operator to deploy and configure one.');
    if (!session || !isConnected) return setMessage(`Connect a Midnight wallet on ${selectedNetwork} before submitting.`);
    if (!ledgerState.room_live) return setMessage('This room is sealed.');
    if (signalValue < threshold) return setMessage(`The private score must clear the public minimum of ${threshold}.`);
    if (hasUsed) return setMessage('This private receipt has already been spent in the active room.');
    if (!pathAvailable) return setMessage('This commitment is not enrolled in the current authorized Merkle tree. Share the commitment with the operator for enrollment, then refresh.');
    setStatus('proving');
    setMessage('Building a proof with the score, secret and Merkle path as private witness inputs.');
    setTxId('');
    try {
      session.providers.privateStateProvider.setContractAddress(address);
      if ((await session.providers.privateStateProvider.get(PRIVATE_STATE_ID)) === null) await session.providers.privateStateProvider.set(PRIVATE_STATE_ID, {});
      const call = await createUnprovenCallTx(session.providers as any, {
        compiledContract: compiled(signalValue, fromHex(identity.secret)),
        contractAddress: address,
        privateStateId: PRIVATE_STATE_ID,
        circuitId: 'claim_pass',
      } as any);
      const submitted = parseTransactionId(await submitTxAsync(session.providers as any, { unprovenTx: call.private.unprovenTx, circuitId: 'claim_pass' } as any));
      setTxId(submitted);
      setStatus('submitted');
      setMessage('Claim submitted to the wallet relayer. Submission is not confirmation; waiting for the network indexer.');
      const confirmation = await waitForIndexedTx(session.providers.publicDataProvider, submitted);
      if (!confirmation.indexed) { setStatus('submitted'); setMessage('Claim was submitted, but indexer confirmation timed out. Do not retry blindly; check the transaction and room state first.'); return; }
      if (confirmation.data?.status !== 'SucceedEntirely') { setStatus('error'); setMessage(`The indexed claim did not succeed (${confirmation.data?.status || 'unknown status'}).`); return; }
      setStatus('indexed');
      setMessage('Claim indexed successfully. The public record reveals a claim, not your score, secret, or Merkle leaf.');
      void refetch();
    } catch (cause: any) { setStatus('error'); setMessage(cause?.message || 'The proof could not be submitted.'); }
  }, [address, hasUsed, identity, isConnected, ledgerState, pathAvailable, refetch, selectedNetwork, session, signalValue, threshold]);

  return <div className="page">
    <div className="page-heading"><div className="section-kicker">Your pass / private eligibility</div><h1>Prove you belong.<br /><em>Keep your reason.</em></h1><p>VoteVault checks an enrolled commitment against the room’s public rule. Your score, 32-byte secret and Merkle path stay inside the proof witness; this interface does not claim absolute wallet anonymity.</p></div>
    <div className="content-grid">
      <section className="panel"><div className="panel-head"><div className="section-kicker">Public room state / {selectedNetwork}</div>{ledgerState?.room_live ? <span className="status-badge"><span>●</span> open</span> : ledgerState ? <span className="status-badge closed"><span>●</span> sealed</span> : null}</div>
        {isLoading ? <div className="empty-state" style={{ marginTop: 20 }}>Reading the public trace…</div> : error ? <div className="notice error" role="alert" style={{ marginTop: 20 }}><ShieldCheck size={15} />{error}</div> : !ledgerState ? <div className="empty-state" style={{ marginTop: 20 }}>No room is configured on {selectedNetwork}.<br /><span className="mono">/admin</span> can deploy one.</div> : <div className="data-list"><div className="data-row"><span className="data-label">Minimum score</span><strong>{threshold.toString()}</strong></div><div className="data-row"><span className="data-label">Visitors</span><strong>{ledgerState.verified_visitors?.toString()} / {ledgerState.visitor_limit?.toString()}</strong></div><div className="data-row"><span className="data-label">Room expires</span><strong>{new Date(Number(ledgerState.expiry) * 1000).toLocaleDateString()}</strong></div><div className="data-row"><span className="data-label">Room salt</span><strong className="mono">{toHex(ledgerState.room_salt).slice(0, 18)}…</strong></div></div>}
        <div className="notice" style={{ marginTop: 20 }}><EyeOff size={15} style={{ color: 'var(--brand)', flexShrink: 0 }} />The public surface shows rules and outcomes—not your score, secret, or source identity.</div>
      </section>
      <section className="panel"><div className="section-kicker">Private side</div><h2>Create your pass material</h2><p>Your secret is generated or imported explicitly and kept in memory only. An operator must enroll the computed commitment before claim_pass can run.</p>
        {!identity ? <button className="button primary" style={{ width: '100%', marginTop: 18 }} onClick={generate}><KeyRound size={15} />Generate 32-byte secret</button> : <>
          <div className="field"><label htmlFor="private-score">Private score · never disclosed</label><input id="private-score" className="input mono" type="number" min="0" value={signal} onChange={(event) => setSignal(event.target.value)} aria-describedby="score-help" /><small id="score-help">Only the threshold comparison is proven. The score is not a circuit argument.</small></div>
          <div className="data-list"><div className="data-row"><span className="data-label">Credential commitment</span><strong className="mono">{commitment ? `${commitment.slice(0, 18)}…` : 'Enter a valid score'}</strong></div><div className="data-row"><span className="data-label">Operator enrollment</span><strong style={{ color: pathAvailable ? 'var(--success)' : 'var(--danger)' }}>{pathAvailable ? 'Found in current tree' : 'Not found yet'}</strong></div><div className="data-row"><span className="data-label">Replay protection</span><strong style={{ color: hasUsed ? 'var(--danger)' : 'var(--success)' }}>{hasUsed ? 'Already used' : 'Unused in this room'}</strong></div></div>
          <label className="field" style={{ marginTop: 16 }}><span><input type="checkbox" checked={backupAcknowledged} onChange={(event) => setBackupAcknowledged(event.target.checked)} /> I understand a backup contains a private secret.</span></label>
          <div className="form-grid"><button className="button subtle" onClick={() => void exportSecret()}><Download size={15} />Copy backup</button><button className="button subtle" onClick={generate}><RefreshCw size={15} />Generate new</button></div>
        </>}
        <div className="field" style={{ marginTop: 16 }}><label htmlFor="secret-import">Import a 32-byte backup</label><div className="copy-line"><input id="secret-import" className="input mono" value={importDraft} onChange={(event) => setImportDraft(event.target.value)} placeholder="64 hex characters" /><button className="tiny-button" onClick={importSecret}><Upload size={14} />Import</button></div></div>
        {!isConnected && <div className="notice" style={{ marginTop: 18 }}><WalletCards size={15} style={{ color: 'var(--brand)', flexShrink: 0 }} />Connect Lace, 1AM or Nightly on {selectedNetwork} to submit.</div>}
        {message && <div className={`notice ${status === 'error' ? 'error' : status === 'indexed' ? 'success' : ''}`} role={status === 'error' ? 'alert' : 'status'} style={{ marginTop: 18 }}><ShieldCheck size={15} style={{ flexShrink: 0 }} />{message}</div>}
        {status === 'indexed' ? <div className="notice success" style={{ marginTop: 18 }}><CheckCircle2 size={16} style={{ flexShrink: 0 }} /><span>Anonymous claim indexed.<br /><span className="mono" style={{ display: 'block', marginTop: 7, wordBreak: 'break-all' }}>{txId}</span><a className="tiny-button" href={getExplorerTxUrl(txId, selectedNetwork)} target="_blank" rel="noreferrer">View transaction ↗</a></span></div> : <button className="button primary" style={{ width: '100%', marginTop: 20 }} disabled={!isReady || status === 'proving' || status === 'submitted'} onClick={() => void claim()}>{status === 'proving' ? <><RefreshCw size={15} className="spin" /> Proving…</> : status === 'submitted' ? <>Waiting for indexer…</> : <>Claim pass privately <ArrowRight size={15} /></>}</button>}
        {!isConnected && <button className="button" style={{ width: '100%', marginTop: 10 }} onClick={() => void connect(selectedNetwork)} disabled={isConnecting || walletStatus === 'not-found'}><LockKeyhole size={15} />{isConnecting ? 'Opening wallet…' : 'Connect wallet'}</button>}
      </section>
    </div>
  </div>;
}
