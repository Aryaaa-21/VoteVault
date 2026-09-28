import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Activity, BookOpen, ChevronDown, ChevronRight, CircleUserRound, ExternalLink, LayoutDashboard, LogOut, Menu, Moon, ShieldCheck, Sun, Waves, X } from 'lucide-react';
import { useWallet } from './contexts/WalletContext';
import LandingPage from './pages/LandingPage';
import GatePage from './pages/GatePage';
import AdminPage from './pages/AdminPage';
import ObservatoryPage from './pages/ObservatoryPage';
import ProtocolPage from './pages/ProtocolPage';
import { getNetwork, setNetwork, subscribeConfiguration, type Network } from './config';

const navItems = [
  { to: '/gate', label: 'Your pass', icon: ShieldCheck },
  { to: '/observatory', label: 'Public record', icon: Activity },
  { to: '/protocol', label: 'Privacy notes', icon: BookOpen },
  { to: '/admin', label: 'Studio', icon: LayoutDashboard },
];

function preferredTheme(): 'night' | 'day' {
  if (typeof window === 'undefined') return 'day';
  const saved = localStorage.getItem('VOTEVAULT_THEME');
  if (saved === 'night' || saved === 'day') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
}

export default function App() {
  const { address, isConnected, connect, disconnect, isConnecting, walletStatus, walletName, availableWallets, error, clearError } = useWallet();
  const [theme, setTheme] = useState<'night' | 'day'>(preferredTheme);
  const [network, setActiveNetwork] = useState<Network>(() => getNetwork());
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const shortAddress = address ? `${address.slice(0, 8)}…${address.slice(-6)}` : '';
  const pageLabel = location.pathname === '/' ? 'Overview' : navItems.find((item) => location.pathname.startsWith(item.to))?.label || 'Overview';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('VOTEVAULT_THEME', theme);
  }, [theme]);
  useEffect(() => subscribeConfiguration(setActiveNetwork), []);
  const changeNetwork = (next: Network) => {
    if (next === network) return;
    if (isConnected) disconnect();
    setNetwork(next);
    setActiveNetwork(next);
  };
  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => setWalletMenuOpen(false), [location.pathname]);

  const chooseWallet = (walletId?: string) => {
    setWalletMenuOpen(false);
    void connect(network, walletId);
  };

  return <div className="app-frame">
    <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
      <Link className="brand-lockup" to="/" aria-label="VoteVault home">
        <span className="brand-glyph" aria-hidden="true"><Waves size={21} strokeWidth={1.6} /></span>
        <span><strong>VOTEVAULT</strong><small>quiet proofs for open rooms</small></span>
      </Link>
      <div className="sidebar-rule" />
      <p className="nav-caption">Explore</p>
      <nav className="primary-nav" aria-label="Primary navigation">
        {navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{to === '/admin' && <span className="nav-lock">operator</span>}</NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <label className="network-card" htmlFor="network-select"><span className="status-orb" /><span><small>Network</small><strong>{network === 'preprod' ? 'Midnight Preprod' : 'Midnight Preview'}</strong></span><ChevronDown size={15} /></label>
        <select id="network-select" className="network-select" value={network} onChange={(event) => changeNetwork(event.target.value as Network)} aria-label="Choose Midnight network"><option value="preview">Preview</option><option value="preprod">Preprod</option></select>
        <a className="docs-link" href="https://docs.midnight.network/" target="_blank" rel="noreferrer">Midnight docs <ExternalLink size={13} /></a>
      </div>
    </aside>

    <div className="content-frame">
      <header className="app-header">
        <button className="mobile-trigger" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <div className="breadcrumb"><span>VoteVault</span><ChevronRight size={14} /><strong>{pageLabel}</strong></div>
        <div className="header-actions">
          <label className="header-network"><span className="sr-only">Network</span><select value={network} onChange={(event) => changeNetwork(event.target.value as Network)} aria-label="Choose Midnight network"><option value="preview">Preview</option><option value="preprod">Preprod</option></select><ChevronDown size={13} /></label>
          <button className="theme-toggle" onClick={() => setTheme(theme === 'night' ? 'day' : 'night')} aria-label={`Switch to ${theme === 'night' ? 'day' : 'night'} mode`} title={`Switch to ${theme === 'night' ? 'day' : 'night'} mode`}>{theme === 'night' ? <Sun size={17} /> : <Moon size={17} />}</button>
          <div className="wallet-control">
            <button className={`wallet-pill ${isConnected ? 'connected' : ''}`} onClick={() => isConnected ? disconnect() : setWalletMenuOpen((value) => !value)} disabled={isConnecting || (!isConnected && walletStatus === 'not-found')} aria-expanded={walletMenuOpen} aria-haspopup="listbox">
              {isConnected ? <><span className="wallet-dot" /><span>{walletName || 'Wallet'} · {shortAddress}</span><LogOut size={14} /></> : <><CircleUserRound size={16} />{isConnecting ? 'Connecting…' : walletStatus === 'not-found' ? 'Wallet unavailable' : 'Connect wallet'}<ChevronDown size={14} /></>}
            </button>
            {walletMenuOpen && !isConnected && <div className="wallet-menu" role="listbox" aria-label="Available wallets">
              {availableWallets.length ? availableWallets.map((wallet) => <button key={wallet.id} role="option" onClick={() => chooseWallet(wallet.id)}><CircleUserRound size={15} /><span><strong>{wallet.name}</strong><small>Connect on {network}</small></span></button>) : <button role="option" onClick={() => chooseWallet()}><CircleUserRound size={15} /><span><strong>Find a wallet</strong><small>Install a Midnight-compatible wallet</small></span></button>}
            </div>}
          </div>
        </div>
      </header>
      {error && <div className="alert-bar" role="alert"><span><ShieldCheck size={16} />{error}</span><button onClick={clearError} aria-label="Dismiss notification"><X size={15} /></button></div>}
      <main><Routes><Route path="/" element={<LandingPage />} /><Route path="/gate" element={<GatePage />} /><Route path="/admin" element={<AdminPage />} /><Route path="/observatory" element={<ObservatoryPage />} /><Route path="/protocol" element={<ProtocolPage />} /></Routes></main>
      <footer className="app-footer"><span><Waves size={14} />VoteVault keeps the proof public and the reason private.</span><span className="footer-code">VOTEVAULT / {network.toUpperCase()}</span></footer>
    </div>
  </div>;
}
