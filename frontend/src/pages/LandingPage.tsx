import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MoonPhase } from '../components/MoonPhase';
import { PrivacyDiagram } from '../components/PrivacyDiagram';
import { Shield, Vote, Lock, Cpu, ArrowRight, ChevronDown, Sparkles } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    { label: 'Total Ballots Cast', value: '2,784,360+' },
    { label: 'Active Referendums', value: '14' },
    { label: 'Spent ZK Nullifiers', value: '100% Unique' },
    { label: 'Identity Protection Rate', value: '100.0%' }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Zero-Knowledge Anonymity',
      description: 'Cast votes verified by zero-knowledge proofs. Your identity key and wallet address are never committed on-chain.'
    },
    {
      icon: Lock,
      title: 'Double-Voting Prevention',
      description: 'Deterministic 32-byte spent nullifiers ensure each eligible voter can submit exactly one ballot per election.'
    },
    {
      icon: Vote,
      title: 'Public Ledger Verifiability',
      description: 'Aggregate election tallies are updated transparently on Midnight consensus nodes for audit verification.'
    },
    {
      icon: Cpu,
      title: 'Local Client Enclave',
      description: 'Private witness compilation and SNARK proofs execute locally inside browser memory using Lace Wallet.'
    }
  ];

  const roadmap = [
    { phase: 'Phase 1 - Q3 2024', title: 'Compact Smart Contract Core', desc: 'Separate Public Ledger State from Private Witness Data with 6 ZK circuits.' },
    { phase: 'Phase 2 - Q4 2024', title: 'Lace Wallet Integration', desc: 'Injected provider connector and local browser enclave witness prover.' },
    { phase: 'Phase 3 - Q1 2025', title: 'Multi-Chain DAO Governance', desc: 'Cross-chain Cardano staking voting rights mapping and quadratic voting.' },
    { phase: 'Phase 4 - Q2 2025', title: 'Institutional Enterprise Suite', desc: 'Multi-sig candidate approval and encrypted shareholder voting tools.' }
  ];

  const testimonials = [
    {
      quote: "VoteVault enabled our DAO to conduct high-stakes treasury referendums without exposing voter wallets to targeted bribery or whale intimidation.",
      author: "Alex V.",
      role: "Governance Lead, Aether DAO"
    },
    {
      quote: "The zero-knowledge nullifier architecture gives our university student union complete voter confidence and audit compliance.",
      author: "Dr. Elena Rostova",
      role: "Student Association Senate Director"
    }
  ];

  const faqs = [
    {
      q: "How does VoteVault guarantee my vote is anonymous?",
      a: "VoteVault uses Midnight's dual-state execution model. Your voter credential secret and choice are kept in browser memory. Only a one-way ZK nullifier hash and option index choice are submitted to consensus nodes."
    },
    {
      q: "How is double-voting prevented if my identity is secret?",
      a: "When you cast a vote, your client computes a deterministic nullifier hash N = SHA256(voter_secret || election_id || salt). The Compact contract checks that N is unspent and records N = true. Any duplicate attempt generates the exact same N and is immediately rejected."
    },
    {
      q: "Which wallets are supported?",
      a: "VoteVault natively supports Lace Wallet (the official Midnight and Cardano wallet extension), injected EVM browser wallets, WalletConnect 2.0, and local developer enclave simulators."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F5] font-body flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8 text-left z-10">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#C9C9C9]">
                <Sparkles className="w-3.5 h-3.5 text-[#6FCF97]" />
                <span>Powered by Midnight Network Zero-Knowledge Contracts</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-[#F5F5F5] leading-[1.1]">
                Vote Privately. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C9C9C9] to-[#8E8E93]">
                  Verify Publicly.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#8E8E93] max-w-2xl leading-relaxed">
                Enterprise-grade privacy governance platform. Cast anonymous ballots with zero-knowledge cryptographic proofs on Midnight, preventing voter intimidation while ensuring 100% public tally verifiability.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                {/* Playwright locator: button:has-text("Connect Wallet") */}
                <button
                  onClick={() => navigate('/connect')}
                  className="px-6 py-3.5 rounded-xl bg-[#F5F5F5] text-[#0B0B0C] font-bold text-sm hover:bg-[#C9C9C9] transition-all shadow-xl hover:shadow-white/10 active:scale-95 flex items-center justify-center space-x-2 group"
                >
                  <span>Connect Wallet</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-[#F5F5F5] font-semibold text-sm hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
                >
                  <Vote className="w-4 h-4 text-[#6FCF97]" />
                  <span>Explore Referendums</span>
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/10">
                {stats.map((s, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="font-heading font-bold text-lg text-[#F5F5F5]">{s.value}</div>
                    <div className="text-[11px] font-mono text-[#8E8E93]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hero Graphic: 3D Lunar Orbit Visualization */}
            <div className="lg:col-span-5 flex justify-center z-0 relative">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-transparent blur-3xl opacity-50 animate-pulse" />
                <MoonPhase size={220} className="relative z-10 drop-shadow-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* BENTO FEATURE CARDS */}
        <section className="py-20 bg-[#151517] border-y border-white/10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="font-heading text-3xl font-bold text-[#F5F5F5]">Engineered for Uncompromising Privacy</h2>
              <p className="text-sm text-[#8E8E93]">Built on Cardano-aligned zero-knowledge technology to eliminate ballot tampering and voter tracking.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div key={idx} className="bento-card p-6 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F5F5F5]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-[#F5F5F5]">{f.title}</h3>
                    <p className="text-xs text-[#8E8E93] leading-relaxed">{f.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* INTERACTIVE PRIVACY MODEL SECTION */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading text-3xl font-bold text-[#F5F5F5]">Dual-State Cryptographic Separation</h2>
            <p className="text-sm text-[#8E8E93]">Explore how Midnight decouples public ledger state from local private witness data.</p>
          </div>

          <PrivacyDiagram />
        </section>

        {/* ROADMAP TIMELINE */}
        <section className="py-20 bg-[#151517] border-y border-white/10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="font-heading text-3xl font-bold text-[#F5F5F5]">Technical Development Roadmap</h2>
              <p className="text-sm text-[#8E8E93]">From Compact smart contract specifications to institutional enterprise voting suites.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roadmap.map((r, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-[#1E1E21] border border-white/10 space-y-3 relative">
                  <span className="text-[11px] font-mono text-[#6FCF97] font-semibold">{r.phase}</span>
                  <h4 className="font-heading font-bold text-base text-[#F5F5F5]">{r.title}</h4>
                  <p className="text-xs text-[#8E8E93] leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading text-3xl font-bold text-[#F5F5F5]">Trusted by Web3 Leaders</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-[#1E1E21] border border-white/10 space-y-4">
                <p className="text-sm text-[#C9C9C9] italic leading-relaxed">"{t.quote}"</p>
                <div>
                  <div className="font-heading font-bold text-sm text-[#F5F5F5]">{t.author}</div>
                  <div className="text-xs font-mono text-[#8E8E93]">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="py-20 bg-[#151517] border-t border-white/10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <h2 className="font-heading text-3xl font-bold text-[#F5F5F5]">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="rounded-xl bg-[#1E1E21] border border-white/10 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-heading font-semibold text-sm text-[#F5F5F5]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#8E8E93] transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs text-[#8E8E93] leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
