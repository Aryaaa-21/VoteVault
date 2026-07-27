import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0B0B0C] border-t border-white/10 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/votevault-logo.png"
                alt="VoteVault Logo"
                className="w-8 h-8 rounded-lg object-cover border border-white/20"
              />
              <span className="font-heading font-bold text-lg text-[#F5F5F5]">VoteVault</span>
            </div>
            <p className="text-xs text-[#8E8E93] leading-relaxed max-w-sm">
              Enterprise-grade privacy-preserving governance platform built for the Midnight Network. Vote privately with zero-knowledge credentials; verify results transparently on-chain.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://github.com/Aryaaa-21/VoteVault"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#C9C9C9] hover:text-[#F5F5F5] transition-colors"
                title="GitHub Repository"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://midnight.network/"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#C9C9C9] hover:text-[#F5F5F5] transition-colors"
                title="Midnight Network"
              >
                <Cpu className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div>
            <h4 className="font-heading font-semibold text-xs text-[#F5F5F5] uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8E8E93]">
              <li><Link to="/dashboard" className="hover:text-[#F5F5F5] transition-colors">Voter Dashboard</Link></li>
              <li><Link to="/privacy" className="hover:text-[#F5F5F5] transition-colors">Privacy Architecture</Link></li>
              <li><Link to="/results" className="hover:text-[#F5F5F5] transition-colors">Ledger Audit Logs</Link></li>
              <li><Link to="/admin" className="hover:text-[#F5F5F5] transition-colors">Admin Console</Link></li>
            </ul>
          </div>

          {/* Column 3: Developers */}
          <div>
            <h4 className="font-heading font-semibold text-xs text-[#F5F5F5] uppercase tracking-wider mb-4">
              Developers
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8E8E93]">
              <li><Link to="/developer" className="hover:text-[#F5F5F5] transition-colors">Midnight SDK API</Link></li>
              <li><Link to="/docs" className="hover:text-[#F5F5F5] transition-colors">Compact Circuit Specs</Link></li>
              <li><a href="https://github.com/Aryaaa-21/VoteVault" target="_blank" rel="noreferrer" className="hover:text-[#F5F5F5] transition-colors inline-flex items-center">Source Code <ExternalLink className="w-3 h-3 ml-1" /></a></li>
            </ul>
          </div>

          {/* Column 4: Legal & Specs */}
          <div>
            <h4 className="font-heading font-semibold text-xs text-[#F5F5F5] uppercase tracking-wider mb-4">
              Protocol & Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8E8E93]">
              <li><span className="text-[#6FCF97] font-mono">Level 1 - 3 Compliant</span></li>
              <li><span className="font-mono">MIT Open Source</span></li>
              <li><span className="text-[#8E8E93]">Zero Data Retention</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8E8E93] font-mono space-y-4 sm:space-y-0">
          <div>© {new Date().getFullYear()} VoteVault Protocol. All rights reserved.</div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center">
              <span className="w-2 h-2 rounded-full bg-[#6FCF97] mr-2 animate-pulse" />
              Midnight Simulation Active
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
