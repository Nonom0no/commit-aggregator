"use client";

import { cn } from "@/lib/cn";
import { GitMerge, GitFork, Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function FloatingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#generator", label: "Generator", icon: GitMerge },
    { href: "#cara-pakai", label: "Cara Pakai", icon: Menu },
  ];

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4" role="banner">
      <nav
        aria-label="Navigasi utama"
        className={cn(
          "flex items-center gap-1 rounded-full border border-rose-200/70 bg-white/60 px-2 py-2",
          "shadow-[0_8px_30px_rgba(244,63,94,0.10)] backdrop-blur-xl",
          "transition-all duration-200 ease-out motion-reduce:transition-none"
        )}
      >
        {/* Logo / Brand */}
        <Link
          href="#"
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-rose-100 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50"
          aria-label="Commit Aggregator - Beranda"
        >
          <GitMerge className="h-5 w-5 text-rose-600" aria-hidden="true" />
          <span className="hidden sm:inline">Commit Aggregator</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-rose-100 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>

        {/* GitHub Link */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-full px-3 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50"
          aria-label="GitHub Repository"
        >
          <GitFork className="h-5 w-5" aria-hidden="true" />
        </a>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden flex items-center justify-center rounded-full p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-20 z-40 px-4 md:hidden animate-fade-in"
          role="navigation"
          aria-label="Menu mobile"
        >
          <div className="mx-auto max-w-sm rounded-2xl border border-rose-200 bg-white p-2 shadow-[0_8px_30px_rgba(244,63,94,0.10)]">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium text-slate-700 hover:bg-rose-100 hover:text-rose-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </Link>
            ))}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <GitFork className="h-5 w-5" aria-hidden="true" />
              GitHub Repository
            </a>
          </div>
        </div>
      )}
    </header>
  );
}