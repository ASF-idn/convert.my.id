'use client';

import MonetagBanner from '@/components/MonetagBanner';
import type { ConverterTool, ToolCategory } from '@/types/converter';
import {
  ArrowRight,
  Box,
  Braces,
  Code2,
  FileCode2,
  FileText,
  Film,
  Image as ImageIcon,
  Layers,
  Palette,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

interface ToolHubProps {
  tools: ConverterTool[];
}

const ALL_CATEGORIES: Array<'All' | ToolCategory> = [
  'All',
  'Code & Dev',
  'Image & Media',
  'CSS & Unit',
  'Text & Data',
  'Audio & Video',
  '3D Model & AR',
];

function getToolIcon(slug: string, category: ToolCategory) {
  if (category === 'Audio & Video') return <Film className="h-5 w-5" />;
  if (category === '3D Model & AR') return <Box className="h-5 w-5" />;
  if (slug.includes('json')) return <Braces className="h-5 w-5" />;
  if (category === 'CSS & Unit') return <Palette className="h-5 w-5" />;
  if (category === 'Image & Media') return <ImageIcon className="h-5 w-5" />;
  if (slug.includes('markdown') || slug.includes('html'))
    return <FileCode2 className="h-5 w-5" />;
  if (category === 'Code & Dev') return <Code2 className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
}

function getCategoryBadgeClasses(category: ToolCategory): string {
  switch (category) {
    case 'Code & Dev':
      return 'border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300';
    case 'CSS & Unit':
      return 'border-pink-500/20 bg-pink-500/10 text-pink-700 dark:text-pink-300';
    case 'Image & Media':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
    case 'Text & Data':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300';
    case 'Audio & Video':
      return 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300';
    case '3D Model & AR':
      return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300';
    default:
      return 'border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300';
  }
}

/**
 * Interactive Client-Side Tool Directory for convert.my.id with real-time search filtering
 * across all 200 tools and 6 categories.
 */
export default function ToolHub({ tools }: ToolHubProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ToolCategory>(
    'All'
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'All' || tool.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      const haystack = [
        tool.h1,
        tool.title,
        tool.shortDesc,
        tool.category,
        tool.slug,
        ...(tool.keywords ?? []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [tools, searchQuery, selectedCategory]);

  const groupedByCategory = useMemo(() => {
    const groups = new Map<ToolCategory, ConverterTool[]>();
    for (const tool of filteredTools) {
      const existing = groups.get(tool.category) ?? [];
      existing.push(tool);
      groups.set(tool.category, existing);
    }
    return Array.from(groups.entries());
  }, [filteredTools]);

  return (
    <section
      id="tools-directory"
      className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"
    >
      {/* Search & Category Filter Control Bar */}
      <div className="relative -mt-8 z-10 mx-auto max-w-3xl">
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-xl shadow-slate-900/5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-black/40">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-4 h-5 w-5 text-slate-400" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search all ${tools.length} converters on convert.my.id (e.g. JSON, MP4 to MP3, OBJ to STL, WebP, PX to REM)...`}
              aria-label="Search converters"
              className="w-full rounded-xl bg-transparent py-3.5 pl-12 pr-20 text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white dark:placeholder-slate-500 sm:text-base"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-3 inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-4 hidden rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-400 sm:inline-block dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {ALL_CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            const count =
              category === 'All'
                ? tools.length
                : tools.filter((t) => t.category === category).length;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-white'
                }`}
              >
                <span>{category}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Monetag Native Banner (Between Hero/Search Bar and Tools Grid) */}
      <div className="mx-auto mt-8 max-w-5xl">
        <MonetagBanner zoneId="ISI_ZONE_ID_NANTI" />
      </div>

      {/* Directory Results */}
      <div className="mt-12 space-y-14">
        {groupedByCategory.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-slate-300 bg-white/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <Layers className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              No converters matched &ldquo;{searchQuery}&rdquo;
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Try searching for another format like JSON, MP4, MP3, STL, GLB,
              CSS, REM, Base64, or WebP.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          groupedByCategory.map(([category, categoryTools]) => (
            <div key={category} className="space-y-5">
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-brand-500" />
                  <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
                    {category}
                  </h2>
                </div>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {categoryTools.length}{' '}
                  {categoryTools.length === 1 ? 'utility' : 'utilities'}
                </span>
              </div>

              {/* Responsive Grid */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {categoryTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/convert/${tool.slug}`}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5 dark:border-slate-800/90 dark:bg-slate-900/70 dark:hover:border-brand-500/50"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-brand-600 transition-colors group-hover:border-brand-500/30 group-hover:bg-brand-500/10 dark:border-slate-800 dark:bg-slate-800/80 dark:text-brand-400">
                          {getToolIcon(tool.slug, tool.category)}
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${getCategoryBadgeClasses(
                            tool.category
                          )}`}
                        >
                          {tool.category}
                        </span>
                      </div>

                      <h3 className="mt-5 text-base font-bold text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                        {tool.h1}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {tool.shortDesc}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-brand-600 dark:border-slate-800/80 dark:text-brand-400">
                      <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                        /convert/{tool.slug}
                      </span>
                      <span className="inline-flex items-center gap-1 transition-transform group-hover:translate-x-1">
                        Launch Tool
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
