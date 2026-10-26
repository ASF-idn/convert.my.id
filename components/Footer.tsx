import { CONVERTER_TOOLS } from '@/lib/converters';
import { Cpu, Lock, Zap } from 'lucide-react';
import Link from 'next/link';

/**
 * SEO-optimized site footer for convert.my.id.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const featuredTools = CONVERTER_TOOLS.slice(0, 12);

  return (
    <footer className="border-t border-slate-200 bg-slate-50/70 dark:border-slate-800/80 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Column 1: Brand & Privacy Philosophy */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Cpu className="h-4 w-4" />
              </div>
              <span className="font-mono text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                convert.my.id
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Built on a strict{' '}
              <strong className="font-semibold text-slate-900 dark:text-slate-200">
                100% Client-Side Processing, Privacy-First, and Zero Server Load
              </strong>{' '}
              architecture. All 100 file conversions and code transformations
              run locally inside your browser via Web APIs and HTML5 Canvas.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-500" />
                Zero Data Retention
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Cloudflare Edge Static Export
              </span>
            </div>
          </div>

          {/* Column 2: Featured Converters */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Featured Converters
            </h2>
            <ul className="mt-4 space-y-2 text-xs">
              {featuredTools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/convert/${tool.slug}`}
                    className="text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                  >
                    {tool.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Architecture & SEO */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Platform &amp; Indexing
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href="/#tools-directory"
                  className="transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                >
                  All 100 Utility Tools
                </Link>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  className="transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                >
                  XML Sitemap (sitemap.xml)
                </a>
              </li>
              <li>
                <a
                  href="/robots.txt"
                  className="transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                >
                  Robots Exclusion (robots.txt)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-6 text-xs text-slate-500 sm:flex-row dark:border-slate-800/80 dark:text-slate-400">
          <p>© {currentYear} convert.my.id. All rights reserved.</p>
          <p className="font-mono">
            convert.my.id • 100% Client-Side • Zero Server Load
          </p>
        </div>
      </div>
    </footer>
  );
}
