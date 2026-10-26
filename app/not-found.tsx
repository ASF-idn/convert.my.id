import { ArrowLeft, SearchX } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
        <SearchX className="h-7 w-7" />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
        Converter Utility Not Found
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        The converter route you requested does not exist on convert.my.id.
        Browse our complete directory of 100 client-side tools below.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to convert.my.id
      </Link>
    </div>
  );
}
