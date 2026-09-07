import { Suspense } from 'react';
import LegacyRedirect from './legacy-route';

// The `[mode]` param here is actually a legacy *type* key (e.g. "addition").
// Legacy URLs were /practice/<type>; Task 13 turns this into a redirect to
// /practice/<realMode>/<type>.
export function generateStaticParams() {
  return [
    'addition','subtraction','multiplication','division','gcd','lcm','power','root',
    'fraction_addition','fraction_subtraction','fraction_multiplication','fraction_division',
    'integer_addition','integer_multiplication','equation_simple','exponent_basic','square_root',
    'quadratic_vertex','log_basic','exp_neural',
  ].map((mode) => ({ mode }));
}

export default function Page({ params }: { params: Promise<{ mode: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LegacyRedirect params={params} />
    </Suspense>
  );
}
