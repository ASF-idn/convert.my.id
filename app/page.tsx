import ToolHub from '@/components/ToolHub';
import { CONVERTER_TOOLS } from '@/lib/converters';
import { Cpu, Lock, ShieldCheck, Zap } from 'lucide-react';

/**
 * Hub / Index Page (/) for convert.my.id
 */
export default function HomePage() {
  const jsonLdWebsite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'convert.my.id',
    url: 'https://convert.my.id',
    description:
      '100% Client-side. Your files and data never leave your browser. 100 free, instant online converters on convert.my.id.',
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
      />

      {/* High-Converting Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 pt-14 pb-20 dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-72 max-w-3xl rounded-full bg-brand-500/15 blur-3xl dark:bg-brand-500/10"
        />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          {/* Prominent Trust Badge / Tagline */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm sm:text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>
              100% Client-side. Your files and data never leave your browser.
            </span>
          </div>

          {/* Primary H1 Headline */}
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
            convert.my.id – Free, Instant &amp; Private Online Converters
          </h1>

          {/* Supporting Subheadline */}
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
            Explore 100 client-side developer, image, CSS, and data utilities on{' '}
            <strong className="font-mono font-semibold text-slate-900 dark:text-white">
              convert.my.id
            </strong>
            . Zero server queues, zero file uploads, and zero privacy
            compromises.
          </p>

          {/* Architectural Value Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-brand-500" />
              <span>100 Client-Side Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Sub-5ms Execution</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-emerald-500" />
              <span>Web APIs &amp; HTML5 Canvas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Search & Categorized 100-Converter Grid */}
      <ToolHub tools={CONVERTER_TOOLS} />
    </div>
  );
}
