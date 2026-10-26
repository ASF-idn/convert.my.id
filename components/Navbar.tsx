import { Cpu, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

/**
 * Global sticky navigation bar for convert.my.id.
 */
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-slate-900 transition-opacity hover:opacity-90 dark:text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm shadow-brand-500/30 transition-transform group-hover:scale-105">
              <Cpu className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-base font-bold tracking-tight leading-none">
                convert.my.id
              </span>
              <span className="mt-0.5 text-[11px] font-medium text-brand-600 dark:text-brand-400">
                100% Client-Side Suite
              </span>
            </div>
          </Link>

          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            <Link
              href="/#tools-directory"
              className="rounded-md px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
            >
              All 100 Tools
            </Link>
            <Link
              href="/convert/json-to-typescript"
              className="rounded-md px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
            >
              JSON to TS
            </Link>
            <Link
              href="/convert/px-to-rem"
              className="rounded-md px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
            >
              PX to REM
            </Link>
            <Link
              href="/convert/image-to-webp"
              className="rounded-md px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
            >
              Image to WebP
            </Link>
          </nav>
        </div>

        {/* Right Actions: Client-Side Privacy Badge + Theme Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>100% Client-Side • Zero Upload</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
