import {
  CONVERTER_TOOLS,
  getConverterBySlug,
  getRelatedConverters,
} from '@/lib/converters';
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Home,
  ShieldCheck,
} from 'lucide-react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';

/**
 * Dynamically load ConverterWorkspace strictly on the client ({ ssr: false })
 * so browser-only engines (Three.js WebGL/Exporters, WebAssembly FFmpeg, HTML5 Canvas)
 * are never evaluated by the Next.js Node.js SSR runtime.
 */
const ConverterWorkspace = dynamic(
  () => import('@/components/ConverterWorkspace'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[460px] animate-pulse rounded-2xl border border-slate-200/90 bg-white/60 p-6 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="h-10 w-full rounded-xl bg-slate-200/70 dark:bg-slate-800/70" />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-[340px] rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
          <div className="h-[340px] rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
        </div>
      </div>
    ),
  }
);

interface ToolPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams(): Array<{ slug: string }> {
  return CONVERTER_TOOLS.map((tool) => ({
    slug: tool.slug,
  }));
}

export function generateMetadata({ params }: ToolPageProps): Metadata {
  const tool = getConverterBySlug(params.slug);
  if (!tool) {
    return {
      title: 'Converter Not Found | convert.my.id',
    };
  }

  const canonicalUrl = `https://convert.my.id/convert/${tool.slug}`;

  return {
    title: tool.title,
    description: tool.metaDescription,
    keywords: tool.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: tool.title,
      description: tool.metaDescription,
      siteName: 'convert.my.id',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.title,
      description: tool.metaDescription,
    },
  };
}

export default function ConverterToolPage({ params }: ToolPageProps) {
  const tool = getConverterBySlug(params.slug);

  if (!tool) {
    notFound();
  }

  const relatedTools = getRelatedConverters(tool.slug, 4);
  const canonicalUrl = `https://convert.my.id/convert/${tool.slug}`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${tool.h1} - convert.my.id`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All (Web Browser)',
    url: canonicalUrl,
    description: tool.metaDescription,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />

      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
        >
          <Home className="h-3.5 w-3.5" />
          <span>convert.my.id</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-600 dark:text-slate-300">
          {tool.category}
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900 dark:text-white">
          {tool.h1}
        </span>
      </nav>

      <header className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-6 lg:flex-row lg:items-end dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-0.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
            <span>{tool.category}</span>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            {tool.h1}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
            {tool.metaDescription}
          </p>
        </div>

        <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>100% Local Browser Execution</span>
        </div>
      </header>

      <ConverterWorkspace tool={tool} />

      {tool.faqs && tool.faqs.length > 0 && (
        <section
          aria-labelledby="faq-heading"
          className="mt-16 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-10 dark:border-slate-800/90 dark:bg-slate-900/70"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="h-5 w-5 text-brand-500" />
            <h2
              id="faq-heading"
              className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white"
            >
              Frequently Asked Questions — {tool.h1}
            </h2>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Technical details, privacy guarantees, and usage tips for our
            client-side {tool.h1.toLowerCase()} on convert.my.id.
          </p>

          <div className="mt-6 divide-y divide-slate-200/80 dark:divide-slate-800/80">
            {tool.faqs.map((faq, index) => (
              <details
                key={index}
                open={index === 0}
                className="group py-4 first:pt-0 last:pb-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-slate-900 transition-colors hover:text-brand-600 dark:text-white dark:hover:text-brand-400">
                  <span>{faq.question}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180 group-open:text-brand-500" />
                </summary>
                <div className="mt-3 pr-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {relatedTools.length > 0 && (
        <section
          aria-labelledby="related-tools-heading"
          className="mt-14 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2
              id="related-tools-heading"
              className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-white"
            >
              Explore More Converters on convert.my.id
            </h2>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              <span>View All 200 Tools</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedTools.map((rel) => (
              <Link
                key={rel.slug}
                href={`/convert/${rel.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 transition-all hover:border-brand-500/50 hover:shadow-md dark:border-slate-800/90 dark:bg-slate-900/70"
              >
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    {rel.category}
                  </span>
                  <h3 className="mt-1.5 text-sm font-bold text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                    {rel.h1}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                    {rel.shortDesc}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
                  Open Converter
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
