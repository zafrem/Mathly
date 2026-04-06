import { Suspense } from 'react';
import PracticeView from '@/components/practice/practice-view';

export function generateStaticParams() {
  return [
    { type: 'addition' },
    { type: 'subtraction' },
    { type: 'multiplication' },
    { type: 'division' },
  ];
}

export default function Page({ params }: { params: Promise<{ type: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-400 animate-pulse">Loading Practice...</div>
      </div>
    }>
      <PracticeView params={params} />
    </Suspense>
  );
}
