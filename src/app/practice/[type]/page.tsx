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
  return <PracticeView params={params} />;
}
