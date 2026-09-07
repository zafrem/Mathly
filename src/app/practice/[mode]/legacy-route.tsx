'use client';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import SessionRunner from '@/components/practice/session-runner';

export default function LegacySessionRoute({ params }: { params: Promise<{ mode: string }> }) {
  const { mode: type } = use(params); // `mode` segment carries a legacy type key
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
