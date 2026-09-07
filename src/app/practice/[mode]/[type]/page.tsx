import { Suspense } from 'react';
import { allTypeKeys, getKind } from '@/lib/practice/registry';
import NestedSessionRoute from './nested-route';

export function generateStaticParams() {
  return allTypeKeys().map((type) => ({ mode: getKind(type).mode, type }));
}

export default function Page({ params }: { params: Promise<{ mode: string; type: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-400 dark:text-gray-600 animate-pulse">Loading…</div>
      </div>
    }>
      <NestedSessionRoute params={params} />
    </Suspense>
  );
}
