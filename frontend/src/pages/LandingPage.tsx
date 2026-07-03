import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVoteVault } from '../context/VoteVaultContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { MoonPhase } from '../components/MoonPhase';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { walletConnected } = useVoteVault();
  const [scrolled, setScrolled] = useState(false);
  const [isVisualHovered, setIsVisualHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLaunchApp = () => {
    if (walletConnected) {
      navigate('/dashboard');
    } else {
      navigate('/connect');
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md transition-colors duration-300">
      
      {/* Premium Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-md border-outline py-3 shadow-sm' 
          : 'bg-transparent border-transparent py-5'
      }`}>
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 w-full max-w-max-width mx-auto">
          <Link to="/" className="flex items-center gap-base no-underline text-primary">
            <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
            <span className="font-headline-md text-xl font-bold tracking-tight text-primary">VoteVault</span>
          </Link>
          <div className="hidden md:flex gap-lg">
            <Link className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors duration-200" to="/dashboard">Elections</Link>
            <Link className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors duration-200" to="/dashboard">Results</Link>
            <a className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors duration-200" href="#privacy-section">Privacy</a>
            <a className="text-on-surface-variant font-medium text-sm hover:text-primary transition-colors duration-200" href="#timeline-section">How It Works</a>
          </div>
          <div className="flex items-center gap-sm">
            <ThemeToggle />
            {walletConnected ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-primary text-on-primary px-lg py-sm rounded font-label-caps text-xs font-bold tracking-wide hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/connect')}
                className="bg-primary text-on-primary px-lg py-sm rounded font-label-caps text-xs font-bold tracking-wide hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-xl overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-on-background/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop w-full grid grid-cols-1 lg:grid-cols-12 gap-xl items-center relative z-10">
          
          {/* Left Side Content */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-6 space-y-lg text-left"
          >
            <motion.h1 
              variants={fadeInUp}
              className="font-display-lg text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary leading-[1.08] glow-text"
            >
              Vote Privately.<br />
              Verify Publicly.
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-on-surface-variant font-body-lg text-lg max-w-[500px] leading-relaxed"
            >
              A privacy-first voting protocol powered by selective disclosure and zero-knowledge technology.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-sm pt-base"
            >
              <button
                onClick={handleLaunchApp}
                className="bg-primary text-on-primary px-xl py-md rounded font-label-caps text-xs font-bold tracking-wider hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                Launch App
              </button>
              <a
                href="#timeline-section"
                className="flex items-center justify-center border border-outline text-primary px-xl py-md rounded font-label-caps text-xs font-bold tracking-wider hover:bg-surface transition-all cursor-pointer"
              >
                Learn More
              </a>
            </motion.div>
            
            {/* Hero Stats */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-3 gap-md border-t border-outline pt-lg mt-xl"
            >
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary tracking-tight">1.2M+</div>
                <div className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant mt-1">Votes Cast</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary tracking-tight">45</div>
                <div className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant mt-1">Active Elections</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary tracking-tight">100%</div>
                <div className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant mt-1">Verifiable</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side Visual: Privacy Network Visualization */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            onMouseEnter={() => setIsVisualHovered(true)}
            onMouseLeave={() => setIsVisualHovered(false)}
            className="lg:col-span-6 flex justify-center items-center relative aspect-square w-full max-w-[480px] mx-auto cursor-pointer"
          >
            {/* Animated Orbits & Central Moon (Unlike Directions) in 3D Perspective */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Outer Orbit (Clockwise) */}
              <div 
                className="absolute w-[92%] h-[92%] rounded-full border border-solid border-on-background/18 flex items-center justify-center animate-orbit-cw"
                style={{ 
                  transform: 'rotateX(66deg) rotateY(-18deg)',
                  transformStyle: 'preserve-3d',
                  animationPlayState: isVisualHovered ? 'paused' : 'running',
                  '--duration': '45s'
                } as React.CSSProperties}
              >
                {/* Large planet */}
                <div 
                  className="absolute top-0 transform -translate-y-1/2 w-4 h-4 rounded-full bg-on-background animate-planet-pulse"
                  style={{ animationDelay: '0s' }}
                ></div>
                {/* Small planet */}
                <div 
                  className="absolute bottom-0 transform translate-y-1/2 w-2 h-2 rounded-full bg-on-background/80 animate-planet-pulse"
                  style={{ animationDelay: '0.6s' }}
                ></div>
              </div>

              {/* Middle Orbit (Counter-Clockwise) */}
              <div 
                className="absolute w-[66%] h-[66%] rounded-full border border-solid border-on-background/28 flex items-center justify-center animate-orbit-ccw"
                style={{ 
                  transform: 'rotateX(66deg) rotateY(-18deg)',
                  transformStyle: 'preserve-3d',
                  animationPlayState: isVisualHovered ? 'paused' : 'running',
                  '--duration': '30s'
                } as React.CSSProperties}
              >
                {/* Medium planet */}
                <div 
                  className="absolute right-0 transform translate-x-1/2 w-3.5 h-3.5 rounded-full bg-on-background animate-planet-pulse"
                  style={{ animationDelay: '1.2s' }}
                ></div>
                {/* Micro planet */}
                <div 
                  className="absolute left-0 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-on-background/60 animate-planet-pulse"
                  style={{ animationDelay: '1.8s' }}
                ></div>
              </div>

              {/* Inner Orbit (Clockwise) */}
              <div 
                className="absolute w-[40%] h-[40%] rounded-full border border-solid border-on-background/38 flex items-center justify-center animate-orbit-cw"
                style={{ 
                  transform: 'rotateX(66deg) rotateY(-18deg)',
                  transformStyle: 'preserve-3d',
                  animationPlayState: isVisualHovered ? 'paused' : 'running',
                  '--duration': '18s'
                } as React.CSSProperties}
              >
                {/* Medium-small planet */}
                <div 
                  className="absolute top-0 transform -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-on-background animate-planet-pulse"
                  style={{ animationDelay: '2.4s' }}
                ></div>
              </div>

              {/* Central Moon Phase Animation (No background container) */}
              {/* Placed at translateZ(0px) in the same preserve-3d container for Z-depth sorting */}
              <div 
                className="relative pointer-events-auto"
                style={{ 
                  transform: 'translateZ(0px)',
                  transformStyle: 'preserve-3d'
                }}
              >
                <MoonPhase size={140} isPaused={isVisualHovered} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-xl px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full relative">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-xl text-left"
        >
          <h2 className="font-headline-xl text-3xl font-bold tracking-tight text-primary mb-xs">Core Security Architecture</h2>
          <p className="text-on-surface-variant font-body-md">Advanced cryptographic primitives ensuring absolute auditability.</p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-gutter"
        >
          {/* Card 1 */}
          <motion.div 
            variants={fadeInUp}
            whileHover={{ scale: 1.03 }}
            className="tonal-card p-lg rounded-xl flex flex-col justify-between group cursor-default"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-surface-container-high border border-outline flex items-center justify-center mb-md text-primary">
                <span className="material-symbols-outlined text-2xl">shield_lock</span>
              </div>
              <h3 className="font-headline-md text-lg font-bold text-primary mb-sm">Zero-Knowledge Proofs</h3>
              <p className="text-on-surface-variant font-body-md text-sm leading-relaxed">
                Prove voting eligibility commitments dynamically without publishing raw address links or ballot choices.
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            variants={fadeInUp}
            whileHover={{ scale: 1.03 }}
            className="tonal-card p-lg rounded-xl flex flex-col justify-between group cursor-default"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-surface-container-high border border-outline flex items-center justify-center mb-md text-primary">
                <span className="material-symbols-outlined text-2xl">key</span>
              </div>
              <h3 className="font-headline-md text-lg font-bold text-primary mb-sm">Non-custodial Auth</h3>
              <p className="text-on-surface-variant font-body-md text-sm leading-relaxed">
                Connect and authenticate sessions instantly using Cardano and Lace wallet cryptographic credential chains.
              </p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            variants={fadeInUp}
            whileHover={{ scale: 1.03 }}
            className="tonal-card p-lg rounded-xl flex flex-col justify-between group cursor-default"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-surface-container-high border border-outline flex items-center justify-center mb-md text-primary">
                <span className="material-symbols-outlined text-2xl">data_exploration</span>
              </div>
              <h3 className="font-headline-md text-lg font-bold text-primary mb-sm">Auditable Inclusion</h3>
              <p className="text-on-surface-variant font-body-md text-sm leading-relaxed">
                Independent nodes compile and verify execution outputs, anchoring public receipt logs to the mainnet.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How it Works: Timeline Visualization */}
      <section id="timeline-section" className="py-xl bg-surface border-t border-b border-outline scroll-mt-20 w-full">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-xl text-left"
          >
            <h2 className="font-headline-xl text-3xl font-bold tracking-tight text-primary mb-xs">Decentralized Governance Timeline</h2>
            <p className="text-on-surface-variant font-body-md">The end-to-end flow of an anonymized zero-knowledge vote.</p>
          </motion.div>

          {/* Timeline Wrapper */}
          <div className="relative mt-xl pl-lg md:pl-0">
            {/* Center Vertical Line (Desktop only) */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-outline-variant transform md:-translate-x-1/2"></div>
            
            {/* Step 1 */}
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between mb-xl">
              <div className="absolute left-[-24px] md:left-1/2 w-8 h-8 rounded-full border border-outline bg-background flex items-center justify-center transform md:-translate-x-1/2 z-10 text-xs font-bold text-primary">
                1
              </div>
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full md:w-[45%] glass-card p-md rounded-lg"
              >
                <h4 className="font-headline-md text-base font-bold text-primary mb-xs">Connect Wallet</h4>
                <p className="text-on-surface-variant text-sm">Link your secure identity credentials or public Web3 wallet to authorize a session securely.</p>
              </motion.div>
              <div className="hidden md:block w-[45%]"></div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between mb-xl">
              <div className="absolute left-[-24px] md:left-1/2 w-8 h-8 rounded-full border border-outline bg-background flex items-center justify-center transform md:-translate-x-1/2 z-10 text-xs font-bold text-primary">
                2
              </div>
              <div className="hidden md:block w-[45%]"></div>
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full md:w-[45%] glass-card p-md rounded-lg"
              >
                <h4 className="font-headline-md text-base font-bold text-primary mb-xs">Verify Eligibility</h4>
                <p className="text-on-surface-variant text-sm">Generate a local witness to verify your active inclusion parameters within zero-knowledge limits.</p>
              </motion.div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between mb-xl">
              <div className="absolute left-[-24px] md:left-1/2 w-8 h-8 rounded-full border border-outline bg-background flex items-center justify-center transform md:-translate-x-1/2 z-10 text-xs font-bold text-primary">
                3
              </div>
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full md:w-[45%] glass-card p-md rounded-lg"
              >
                <h4 className="font-headline-md text-base font-bold text-primary mb-xs">Cast Secure Ballot</h4>
                <p className="text-on-surface-variant text-sm">Submit your encrypted selection. A private nullifier hash registers consensus to protect your choice.</p>
              </motion.div>
              <div className="hidden md:block w-[45%]"></div>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="absolute left-[-24px] md:left-1/2 w-8 h-8 rounded-full border border-outline bg-background flex items-center justify-center transform md:-translate-x-1/2 z-10 text-xs font-bold text-primary">
                4
              </div>
              <div className="hidden md:block w-[45%]"></div>
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full md:w-[45%] glass-card p-md rounded-lg"
              >
                <h4 className="font-headline-md text-base font-bold text-primary mb-xs">Verify Inclusion</h4>
                <p className="text-on-surface-variant text-sm">Verify your vote has been compiled without exposing your identity or public key.</p>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Privacy Model Section */}
      <section id="privacy-section" className="py-xl px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full scroll-mt-20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-xl text-left"
        >
          <h2 className="font-headline-xl text-3xl font-bold tracking-tight text-primary mb-xs">The Privacy Model</h2>
          <p className="text-on-surface-variant font-body-md">Understand which transaction fields map directly to the ledger consensus.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
          {/* Public Data Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-outline rounded-xl p-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-md">
                <span className="font-label-caps text-xs font-semibold text-primary bg-primary/10 px-sm py-xs rounded">Public Ledger</span>
                <span className="material-symbols-outlined text-green-500">visibility</span>
              </div>
              <h3 className="font-headline-md text-lg font-bold text-primary mb-sm">Visible Information</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-lg">
                Required data metrics for public tally audits. Anyone can confirm mathematical execution parameters.
              </p>
              <div className="space-y-sm font-mono-technical text-xs border-t border-outline-variant pt-md">
                <div className="flex justify-between py-xs border-b border-outline-variant/40">
                  <span>Election Results:</span>
                  <span className="text-primary font-bold">PUBLIC</span>
                </div>
                <div className="flex justify-between py-xs border-b border-outline-variant/40">
                  <span>Vote Totals:</span>
                  <span className="text-primary font-bold">PUBLIC</span>
                </div>
                <div className="flex justify-between py-xs">
                  <span>Participation Ratio:</span>
                  <span className="text-primary font-bold">PUBLIC</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Private Data Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-outline rounded-xl p-lg flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-50 blur-xl pointer-events-none"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-md">
                <span className="font-label-caps text-xs font-semibold text-primary bg-primary/10 px-sm py-xs rounded">Encrypted State</span>
                <span className="material-symbols-outlined text-primary">visibility_off</span>
              </div>
              <h3 className="font-headline-md text-lg font-bold text-primary mb-sm">Private Information</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-lg">
                Decoupled variables hidden behind local ZK-witness generation. Identity keys never leave your machine.
              </p>
              <div className="space-y-sm font-mono-technical text-xs border-t border-outline-variant pt-md">
                <div className="flex justify-between items-center py-xs border-b border-outline-variant/40">
                  <span>Voter Identity:</span>
                  <span className="text-primary flex items-center gap-xs font-bold">
                    <span className="material-symbols-outlined text-xs">lock</span> SECURE
                  </span>
                </div>
                <div className="flex justify-between items-center py-xs border-b border-outline-variant/40">
                  <span>Ballot Priority Selection:</span>
                  <span className="text-primary flex items-center gap-xs font-bold">
                    <span className="material-symbols-outlined text-xs">lock</span> SECURE
                  </span>
                </div>
                <div className="flex justify-between items-center py-xs">
                  <span>Wallet Address Linkage:</span>
                  <span className="text-primary flex items-center gap-xs font-bold">
                    <span className="material-symbols-outlined text-xs">lock</span> SECURE
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full py-xl bg-surface border-t border-outline mt-auto transition-colors duration-300">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-start md:items-center gap-xl w-full">
          <div>
            <div className="flex items-center gap-base text-primary mb-xs">
              <span className="material-symbols-outlined text-xl">account_balance</span>
              <span className="font-label-caps text-sm font-bold tracking-tight">VoteVault</span>
            </div>
            <p className="text-xs text-on-surface-variant font-mono-technical mt-1">© 2024 VoteVault. Secure consensus.</p>
          </div>
          
          <div className="flex flex-wrap gap-lg text-sm text-on-surface-variant">
            <a className="hover:text-primary transition-colors no-underline" href="#">GitHub</a>
            <a className="hover:text-primary transition-colors no-underline" href="#">Documentation</a>
            <a className="hover:text-primary transition-colors no-underline" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors no-underline" href="#">Terms</a>
            <a className="hover:text-primary transition-colors no-underline" href="#">Security Audit</a>
          </div>

          <div className="flex gap-sm">
            <a className="w-9 h-9 rounded-full border border-outline flex items-center justify-center hover:border-primary text-primary transition-all" href="#" aria-label="Github Link">
              <span className="material-symbols-outlined text-base">hub</span>
            </a>
            <a className="w-9 h-9 rounded-full border border-outline flex items-center justify-center hover:border-primary text-primary transition-all" href="#" aria-label="Terminal docs">
              <span className="material-symbols-outlined text-base">code</span>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};
