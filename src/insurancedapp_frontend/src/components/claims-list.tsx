
'use client';

import { Claim } from '@/lib/data';
import { ClaimCard } from './claim-card';

type ClaimsListProps = {
  claims: Claim[];
};

export function ClaimsList({ claims }: ClaimsListProps) {
  if (claims.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>There are no pending claims at the moment.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50">
      {claims.map((claim) => (
        <ClaimCard key={claim.id} claim={claim} />
      ))}
    </div>
  );
}
