'use client';
import { use, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PROBLEM_TYPES } from '@/lib/practice/registry';
import type { TypeKey } from '@/lib/practice/types';

export default function LegacyRedirect({ params }: { params: Promise<{ mode: string }> }) {
  const { mode: type } = use(params); // `mode` segment carries a legacy type key
  const sp = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const kind = PROBLEM_TYPES[type as TypeKey];
    const qs = sp.toString();
    router.replace(kind ? `/practice/${kind.mode}/${type}${qs ? `?${qs}` : ''}` : '/');
  }, [type, sp, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-2xl font-bold text-gray-400 dark:text-gray-600 animate-pulse">Loading…</div>
    </div>
  );
}
