import { Activity, ExternalLink, Hash, RefreshCw, TreePine } from 'lucide-react';
import { getContractAddress, getExplorerContractUrl } from '../config';
import { toHex } from '../lib/midnight';
import { useContractState } from '../hooks/useContractState';

function displayHex(value: unknown, length = 18) {
  try { return `${toHex(value as Uint8Array).slice(0, length)}…`; } catch { return '—'; }
}

export default function ObservatoryPage() {
  const address = getContractAddress();
  const { ledgerState, isLoading, error, lastUpdate, refetch } = useContractState(4000);
  const receipts: string[] = [];
  try {
    if (ledgerState?.spent_tokens?.[Symbol.iterator]) for (const item of ledgerState.spent_tokens) receipts.push(toHex(item));
  } catch { /* tolerate indexer shape differences */ }
  const used = ledgerState ? Number(ledgerState.verified_visitors || 0) : 0;
  const limit = ledgerState ? Number(ledgerState.visitor_limit || 0) : 0;
  const fill = limit > 0 ? Math.min(100, used / limit * 100) : 0;
  let root = '—';
  try { root = ledgerState?.authorized_credentials ? String(ledgerState.authorized_credentials.root().field) : '—'; } catch { /* older indexer shape */ }

  return <div className="page observatory-page">
    <div className="page-heading"><div className="section-kicker">Public record</div><h1>Follow the result,<br /><em>not the visitor.</em></h1><p>This is the public ledger surface. It mirrors room configuration, aggregate counters, the authorized-credential root, and unlinkable receipt tokens. It does not turn private eligibility into a directory.</p></div>
    {!address && <div className="notice" style={{ marginBottom: 20 }}><Activity size={15} />No contract address is configured. An operator can deploy a room from Studio; this view will read it once an address is available.</div>}
    {error && <div className="notice error" style={{ marginBottom: 20 }}><Activity size={15} />The indexer could not be read. Try refreshing, or check the configured network.</div>}
    <div className="metric-strip"><div className="metric"><strong>{ledgerState?.verified_visitors?.toString() || '—'}</strong><small>verified visitors</small></div><div className="metric"><strong>{ledgerState?.visitor_limit?.toString() || '—'}</strong><small>published capacity</small></div><div className="metric"><strong>{ledgerState ? receipts.length : '—'}</strong><small>indexed receipts</small></div><div className="metric"><strong>{ledgerState ? (ledgerState.room_live ? 'OPEN' : 'SEALED') : '—'}</strong><small>room state</small></div></div>
    <div className="content-grid" style={{ marginTop: 15 }}>
      <section className="panel"><div className="panel-head"><div className="section-kicker">Room configuration</div><button className="tiny-button" onClick={() => void refetch()} aria-label="Refresh public room state"><RefreshCw size={14} /></button></div>
        {isLoading && !ledgerState ? <div className="empty-state" style={{ marginTop: 20 }}>Reading the public ledger…</div> : !ledgerState ? <div className="empty-state" style={{ marginTop: 20 }}>No indexed room state yet.<br />The chain has not supplied a readable room record.</div> : <div className="data-list"><div className="data-row"><span className="data-label">Contract</span><a className="tiny-button mono" href={getExplorerContractUrl()} target="_blank" rel="noreferrer">{address.slice(0, 10)}… <ExternalLink size={12} /></a></div><div className="data-row"><span className="data-label">Minimum signal</span><strong>{ledgerState.minimum_signal?.toString()} points</strong></div><div className="data-row"><span className="data-label">Room salt</span><strong>{displayHex(ledgerState.room_salt)}</strong></div><div className="data-row"><span className="data-label">Expiry</span><strong>{new Date(Number(ledgerState.expiry) * 1000).toLocaleString()}</strong></div><div className="data-row"><span className="data-label">Issuer commitment</span><strong>{displayHex(ledgerState.issuer_id)}</strong></div><div className="data-row"><span className="data-label">Credential tree root</span><strong className="mono">{root === '—' ? root : `${root.slice(0, 18)}…`}</strong></div></div>}
        {ledgerState && <><div className="data-label" style={{ display: 'block', marginTop: 23 }}>Published capacity used</div><div className="progress" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={limit}><span style={{ width: `${fill}%` }} /></div><div className="mono data-footnote">{used} of {limit} published places · derived from public counters</div></>}
      </section>
      <section className="panel"><div className="section-kicker">Receipt feed</div><h2>Anonymous arrivals</h2><p>These room-scoped tokens are public spent entries. They show that a receipt was recorded, not who held the secret or which credential was proven.</p>{receipts.length === 0 ? <div className="empty-state" style={{ marginTop: 22 }}><TreePine size={20} /><br />{ledgerState ? 'No public receipts indexed yet.' : 'Receipts will appear after a room is indexed.'}</div> : <div className="feed">{receipts.slice().reverse().map((item, index) => <div className="feed-item" key={item}><span className="feed-dot" /><div><strong>Receipt {receipts.length - index}</strong><p><Hash size={11} /> {item}</p></div></div>)}</div>}{lastUpdate && <div className="mono data-footnote last-read">LAST INDEXER READ · {lastUpdate.toLocaleTimeString()}</div>}</section>
    </div>
    <section className="record-note"><div className="section-kicker">Read this surface carefully</div><p>Public state is useful for accountability, but it is not proof of anonymity by itself. Timing, room size, wallet behavior, and outside information can still create links. <a href="/protocol">See the protocol limits.</a></p></section>
  </div>;
}
