import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoteVault } from '../context/VoteVaultContext';
import { ThemeToggle } from './ThemeToggle';
import { Search, Bell, Cpu, Menu, X, LayoutDashboard, Lock, FileSpreadsheet, ShieldAlert, Code2, BookOpen, ChevronRight, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    walletConnected,
    walletAddress,
    disconnectWallet,
    simulationMode,
    toggleSimulationMode,
    notifications,
    markNotificationRead,
    setCommandPaletteOpen
  } = useVoteVault();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isActive = (path: string) => location.pathname === path;

  // Lock body scroll and handle Escape key when mobile menu is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setNotificationsOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Close drawers on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0B0C]/85 backdrop-blur-xl border-b border-white/10 transition-colors">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 lg:gap-4 w-full">
        {/* 1. Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 shrink-0 group py-1">
          <img
            src="/votevault-logo.png"
            alt="VoteVault Logo"
            className="w-9 h-9 rounded-xl object-cover border border-white/20 shadow-lg group-hover:scale-105 transition-transform"
          />
          <div className="flex items-center space-x-2">
            <span className="font-heading font-bold text-lg tracking-tight text-[#F5F5F5] whitespace-nowrap">VoteVault</span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-[#C9C9C9] uppercase tracking-wider">MIDNIGHT</span>
          </div>
        </Link>

        {/* 2. Desktop Navigation Links (Visible on lg 1024px+) */}
        <div className="hidden lg:flex items-center space-x-1 xl:space-x-2 shrink-0">
          <Link
            to="/dashboard"
            className={`px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${isActive('/dashboard') ? 'bg-white/10 text-[#F5F5F5] shadow-sm' : 'text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/5'
              }`}
          >
            Dashboard
          </Link>
          <Link
            to="/privacy"
            className={`px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${isActive('/privacy') ? 'bg-white/10 text-[#F5F5F5] shadow-sm' : 'text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/5'
              }`}
          >
            Privacy Model
          </Link>
          <Link
            to="/results"
            className={`px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${isActive('/results') ? 'bg-white/10 text-[#F5F5F5] shadow-sm' : 'text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/5'
              }`}
          >
            Ledger Audit
          </Link>
          <Link
            to="/admin"
            className={`px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${isActive('/admin') ? 'bg-white/10 text-[#F5F5F5] shadow-sm' : 'text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/5'
              }`}
          >
            Admin
          </Link>
          <Link
            to="/developer"
            className={`px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${isActive('/developer') ? 'bg-white/10 text-[#F5F5F5] shadow-sm' : 'text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/5'
              }`}
          >
            Dev API
          </Link>
          <Link
            to="/docs"
            className={`px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${isActive('/docs') ? 'bg-white/10 text-[#F5F5F5] shadow-sm' : 'text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/5'
              }`}
          >
            Docs
          </Link>
        </div>

        {/* 3. Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Simulation Mode Badge */}
          <button
            onClick={toggleSimulationMode}
            title="Click to toggle Simulation Mode"
            className={`hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all whitespace-nowrap ${simulationMode
                ? 'bg-[#F2C94C]/10 border-[#F2C94C]/30 text-[#F2C94C] hover:bg-[#F2C94C]/20'
                : 'bg-[#6FCF97]/10 border-[#6FCF97]/30 text-[#6FCF97]'
              }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{simulationMode ? 'Simulation Mode' : 'Preprod Testnet'}</span>
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-2 rounded-lg bg-white/5 text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Open Command Search Palette"
            title="Search (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="p-2 rounded-lg bg-white/5 text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/10 transition-colors relative focus:outline-none focus:ring-2 focus:ring-white/20 min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Open Notifications"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EB5757] animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 bg-[#1E1E21] border border-white/10 rounded-xl shadow-2xl p-3 z-50"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-heading font-semibold text-[#F5F5F5]">Activity Feed</span>
                    <span className="text-[10px] font-mono text-[#8E8E93]">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto py-2 space-y-2">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => markNotificationRead(item.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${item.read
                            ? 'bg-[#151517] border-transparent text-[#8E8E93]'
                            : 'bg-white/5 border-white/10 text-[#F5F5F5]'
                          }`}
                      >
                        <div className="flex justify-between font-semibold">
                          <span>{item.title}</span>
                          <span className="text-[10px] font-mono text-[#8E8E93]">{item.time}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-[#C9C9C9]">{item.message}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Wallet Button */}
          {walletConnected ? (
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              <Link
                to="/dashboard"
                className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-mono text-[#F5F5F5] hover:bg-white/20 transition-all flex items-center space-x-2 whitespace-nowrap min-h-[40px]"
              >
                <span className="w-2 h-2 rounded-full bg-[#6FCF97] animate-pulse shrink-0" />
                <span className="truncate max-w-[90px] sm:max-w-[120px]">{walletAddress ? walletAddress.substring(0, 10) : '0x89FB-X12'}</span>
              </Link>
              <button
                onClick={disconnectWallet}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 text-xs text-[#8E8E93] hover:text-[#EB5757] hover:bg-white/10 transition-colors hidden sm:block min-h-[40px]"
                title="Disconnect Wallet"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/connect')}
              className="px-3.5 py-2 rounded-xl bg-[#F5F5F5] text-[#0B0B0C] font-semibold text-xs hover:bg-[#C9C9C9] transition-all shadow-lg hover:shadow-white/10 active:scale-95 flex items-center space-x-1.5 whitespace-nowrap min-h-[40px] shrink-0"
            >
              <span>Connect Wallet</span>
            </button>
          )}

          {/* Mobile/Tablet Menu Trigger (< 1024px) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg bg-white/5 text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/10 transition-colors focus:outline-none min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Open Mobile Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Over Drawer (< 1024px) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark Overlay Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md lg:hidden"
            />

            {/* Slide Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-[#0B0B0C]/95 border-l border-white/10 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto lg:hidden"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src="/votevault-logo.png"
                      alt="VoteVault Logo"
                      className="w-8 h-8 rounded-lg object-cover border border-white/20"
                    />
                    <span className="font-heading font-bold text-base text-[#F5F5F5]">VoteVault</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/10 transition-colors"
                    aria-label="Close Menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation Link Groups */}
                <div className="space-y-5">
                  <div>
                    <div className="text-[11px] font-mono text-[#8E8E93] uppercase tracking-wider mb-2">Governance</div>
                    <div className="space-y-1">
                      <Link
                        to="/dashboard"
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-white/15 text-[#F5F5F5]' : 'text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/5'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <LayoutDashboard className="w-4 h-4 text-[#6FCF97]" />
                          <span>Dashboard</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
                      </Link>

                      <Link
                        to="/results"
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/results') ? 'bg-white/15 text-[#F5F5F5]' : 'text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/5'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <FileSpreadsheet className="w-4 h-4 text-[#F2C94C]" />
                          <span>Ledger Audit</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
                      </Link>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-[#8E8E93] uppercase tracking-wider mb-2">Protocol Privacy</div>
                    <div className="space-y-1">
                      <Link
                        to="/privacy"
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/privacy') ? 'bg-white/15 text-[#F5F5F5]' : 'text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/5'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Lock className="w-4 h-4 text-[#6FCF97]" />
                          <span>Privacy Model</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
                      </Link>

                      <Link
                        to="/docs"
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/docs') ? 'bg-white/15 text-[#F5F5F5]' : 'text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/5'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <BookOpen className="w-4 h-4 text-[#C9C9C9]" />
                          <span>Documentation</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
                      </Link>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-[#8E8E93] uppercase tracking-wider mb-2">Administration</div>
                    <div className="space-y-1">
                      <Link
                        to="/admin"
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/admin') ? 'bg-white/15 text-[#F5F5F5]' : 'text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/5'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <ShieldAlert className="w-4 h-4 text-[#EB5757]" />
                          <span>Admin Console</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
                      </Link>

                      <Link
                        to="/developer"
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('/developer') ? 'bg-white/15 text-[#F5F5F5]' : 'text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/5'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Code2 className="w-4 h-4 text-[#F2C94C]" />
                          <span>Developer API</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Controls */}
              <div className="pt-6 border-t border-white/10 space-y-3">
                <button
                  onClick={toggleSimulationMode}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono border flex items-center justify-between transition-all ${simulationMode
                      ? 'bg-[#F2C94C]/10 border-[#F2C94C]/30 text-[#F2C94C]'
                      : 'bg-[#6FCF97]/10 border-[#6FCF97]/30 text-[#6FCF97]'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4" />
                    <span>Mode:</span>
                  </div>
                  <span className="font-bold">{simulationMode ? 'Simulation' : 'Preprod Testnet'}</span>
                </button>

                {walletConnected ? (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-[#6FCF97] flex items-center justify-between">
                      <span className="truncate">{walletAddress}</span>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="w-full py-2.5 rounded-xl bg-white/5 text-xs text-[#EB5757] hover:bg-white/10 transition-colors flex items-center justify-center space-x-2 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Disconnect Session</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/connect');
                    }}
                    className="w-full py-3 rounded-xl bg-[#F5F5F5] text-[#0B0B0C] font-bold text-xs hover:bg-[#C9C9C9] transition-all shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>Connect Wallet</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
