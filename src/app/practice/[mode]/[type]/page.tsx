import { Suspense } from 'react';
import { allTypeKeys, getKind } from '@/lib/practice/registry';
import NestedSessionRoute from './nested-route';

export function generateStaticParams() {
  return allTypeKeys().map((type) => ({ mode: getKind(type).mode, type }));
}

export default function Page({ params }: { params: Promise<{ mode: string; type: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <NestedSessionRoute params={params} />
    </Suspense>
  );
}
