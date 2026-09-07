'use client';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import SessionRunner from '@/components/practice/session-runner';

export default function NestedSessionRoute({ params }: { params: Promise<{ mode: string; type: string }> }) {
  const { type } = use(params);
  const sp = useSearchParams();
  return (
    <SessionRunner
      type={type}
      digits={parseInt(sp.get('digits') || '2')}
      initialTime={parseInt(sp.get('time') || '60')}
      userName={sp.get('user') || 'Anonymous'}
      level={sp.get('level') || ''}
    />
  );
}
