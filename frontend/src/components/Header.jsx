import { useState, useEffect } from "react";
import { FiDownload, FiMenu, FiX } from "react-icons/fi";

export default function Header({ entryCount, chainValid, onExport, onOpenTamperLab }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "explorer", href: "#explorer" },
    { label: "chain", href: "#chain" },
    { label: "register", href: "#register" },
    { label: "verify", href: "#verify" },
    { label: "checkpoints", href: "#checkpoints" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 h-[68px] z-50 transition-all duration-300 flex items-center px-4 sm:px-8 border-b ${
          scrolled
            ? "bg-[#0a0a0a]/90 backdrop-blur-md border-[#242424] shadow-[0_8px_24px_-16px_rgba(0,0,0,0.8)]"
            : "bg-[#000000]/80 backdrop-blur-sm border-[#1a1a1a]"
        }`}
      >
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-[6px] bg-[#111111] border border-[#242424] flex items-center justify-center text-[#c9793f] group-hover:border-[#c9793f]/50 transition-colors shadow-[0_0_12px_rgba(201,121,63,0.15)]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-semibold tracking-widest text-[#f0ece9] lowercase group-hover:text-white transition-colors">
                hash<span className="text-[#c9793f]">log</span>
              </span>
              <span className="font-mono text-[9px] tracking-wider text-[#8a8480] uppercase">
                integrity ledger
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-full px-3 py-1.5 shadow-inner">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono text-xs text-[#b8b2ae] hover:text-[#f0ece9] hover:bg-[#161616] px-3 py-1 rounded-full transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Chain Status Pill */}
            <div
              className={`hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-[11px] border transition-colors ${
                chainValid === false
                  ? "bg-red-950/40 text-red-400 border-red-800/60 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                  : chainValid === true
                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  : "bg-[#111111] text-[#b8b2ae] border-[#242424]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  chainValid === false
                    ? "bg-red-400 animate-ping"
                    : chainValid === true
                    ? "bg-emerald-400"
                    : "bg-[#c9793f] animate-pulse"
                }`}
              />
              <span>
                {chainValid === false
                  ? "TAMPER DETECTED"
                  : chainValid === true
                  ? `VERIFIED (${entryCount})`
                  : `${entryCount} PROOFS`}
              </span>
            </div>

            {/* Export Ledger Button */}
            {onExport && (
              <button
                onClick={onExport}
                title="Export Immutable Ledger proofs as JSON"
                className="hidden lg:inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#b8b2ae] hover:text-[#f0ece9] bg-[#0a0a0a] hover:bg-[#161616] border border-[#242424] hover:border-[#2e2e2e] px-3 py-1.5 rounded-[6px] transition-all"
              >
                <FiDownload className="w-3.5 h-3.5 text-[#c9793f]" />
                <span>Export</span>
              </button>
            )}

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-[6px] bg-[#111111] border border-[#242424] text-[#b8b2ae] hover:text-[#f0ece9]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <FiX className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-72 bg-[#0a0a0a] border-l border-[#1a1a1a] p-6 z-50 flex flex-col gap-3 transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a]">
          <span className="font-mono text-xs font-medium text-[#b8b2ae] uppercase tracking-wider">
            Navigation
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-[6px] bg-[#161616] text-[#8a8480] hover:text-[#f0ece9]"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-1 py-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="font-mono text-sm text-[#b8b2ae] hover:text-[#f0ece9] hover:bg-[#161616] px-3 py-2.5 rounded-[6px] transition-colors uppercase tracking-wider"
            >
              {link.label}
            </a>
          ))}
        </div>

        {onExport && (
          <button
            onClick={() => {
              onExport();
              setMobileOpen(false);
            }}
            className="mt-auto w-full flex items-center justify-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-black bg-[#f0ece9] hover:bg-white py-3 rounded-[6px] transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            <span>Export JSON Ledger</span>
          </button>
        )}
      </div>
    </>
  );
}
