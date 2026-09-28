import { ArrowUpRight, Eye, Fingerprint, KeyRound, LockKeyhole, Map, ShieldCheck, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return <div className="page landing-page">
    <section className="hero hero-editorial">
      <div className="hero-copy">
        <div className="section-kicker">Private eligibility / public certainty</div>
        <h1 className="hero-title">A little proof.<br /><em>A lot left private.</em></h1>
        <p>VoteVault gives small communities a calm way to check eligibility. A visitor proves a salted credential belongs to an operator-approved set and clears the room’s threshold. The reason stays behind the proof.</p>
        <div className="actions"><Link className="button primary" to="/gate">Check your pass <ArrowUpRight size={16} /></Link><Link className="button" to="/protocol">Read the privacy notes</Link></div>
        <div className="hero-meta"><span><strong>01</strong> private signal</span><span><strong>02</strong> Merkle membership</span><span><strong>03</strong> public receipt</span></div>
      </div>
      <div className="hero-image-wrap">
        <div className="hero-image" role="img" aria-label="Still lake surrounded by forest at dawn" />
        <div className="image-caption"><span>VoteVault / field note 01</span><span>the surface shows the result</span></div>
        <div className="hero-stamp"><Waves size={19} /><span>proofs<br />without<br />the story</span></div>
      </div>
    </section>

    <section className="section intro-band"><div className="section-head"><div><div className="section-kicker">For rooms with a reason to be selective</div><h2>Let “eligible” be<br />enough information.</h2></div><p>For research groups, private betas, member circles, and invitations where the source credential should not become a new public record.</p></div>
      <div className="insight-grid"><article className="insight"><Fingerprint size={21} /><div><h3>Membership, not identity</h3><p>The operator approves salted credential commitments. A visitor proves membership without revealing which leaf they hold.</p></div></article><article className="insight"><KeyRound size={21} /><div><h3>Threshold stays useful</h3><p>A private signal can clear the room’s public minimum while its value and source remain private witness data.</p></div></article><article className="insight"><Eye size={21} /><div><h3>Trace without a dossier</h3><p>The ledger exposes configuration, counters, roots, and one-time receipts—not a list of visitor identities.</p></div></article></div>
    </section>

    <section className="photo-break" aria-label="Forest detail"><div className="photo-break-image" /><div className="photo-break-copy"><span className="section-kicker">A smaller public surface</span><p>Every room has a visible boundary. The proof decides what crosses it.</p></div></section>

    <section className="section"><div className="section-head"><div><div className="section-kicker">Three places to begin</div><h2>Choose the view<br />that fits your role.</h2></div></div><div className="route-strip"><Link className="route-card" to="/gate"><span className="route-icon"><LockKeyhole size={18} /></span><small>Your pass</small><strong>Check eligibility privately</strong><span>Bring a signal and a secret. The room receives a result.</span><ArrowUpRight size={17} /></Link><Link className="route-card" to="/observatory"><span className="route-icon"><Map size={18} /></span><small>Public record</small><strong>Read the ledger surface</strong><span>See only the configuration and receipts the chain makes public.</span><ArrowUpRight size={17} /></Link><Link className="route-card" to="/protocol"><span className="route-icon"><ShieldCheck size={18} /></span><small>Privacy notes</small><strong>Understand the boundary</strong><span>Follow the Merkle path, nullifier, threshold, and their limits.</span><ArrowUpRight size={17} /></Link></div></section>

    <section className="closing-band"><div><span className="section-kicker">Start with the honest surface</span><h2>Nothing to hide behind<br /><em>when less is revealed.</em></h2></div><Link className="button primary" to="/observatory">View the public record <ArrowUpRight size={16} /></Link></section>
  </div>;
}
