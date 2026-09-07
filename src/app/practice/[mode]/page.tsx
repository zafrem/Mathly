import { Suspense } from 'react';
import { allTypeKeys } from '@/lib/practice/registry';
import LegacyRedirect from './legacy-route';

// The `[mode]` param here is actually a legacy *type* key (e.g. "addition").
// Legacy URLs were /practice/<type>; Task 13 turns this into a redirect to
// /practice/<realMode>/<type>.
export function generateStaticParams() {
  return allTypeKeys().map((mode) => ({ mode }));
}

export default function Page({ params }: { params: Promise<{ mode: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-400 dark:text-gray-600 animate-pulse">Loading…</div>
      </div>
    }>
      <LegacyRedirect params={params} />
    </Suspense>
  );
}
