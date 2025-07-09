import { useState } from 'react';
import { CheckCircle, DollarSign, FileText, User, XCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Claim } from '@/lib/data';

export function ClaimCard({ claim: initialClaim }: { claim: Claim }) {
  const [claim, setClaim] = useState(initialClaim);
  const [voted, setVoted] = useState<'approved' | 'rejected' | null>(null);

  const handleVote = (vote: 'approved' | 'rejected') => {
    setVoted(vote);
    setClaim(prev => ({
      ...prev,
      status: vote === 'approved' ? 'Approved' : 'Rejected',
    }));
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'default';
      case 'Rejected':
        return 'destructive';
      case 'Pending':
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="flex flex-col h-full transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center justify-between">
          <span>Claim Details</span>
          <Badge variant={getStatusVariant(claim.status)} className="capitalize font-headline">
            {claim.status}
          </Badge>
        </CardTitle>
        <CardDescription className="font-body pt-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {claim.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center text-lg font-semibold">
          <DollarSign className="w-5 h-5 mr-2 text-primary" />
          <span className="font-body">
            {claim.amount.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}
          </span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="w-4 h-4 mr-2" />
          <span className="font-body">Recipient: {claim.recipient}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleVote('approved')}
          disabled={!!voted}
          className={cn(voted === 'approved' && 'bg-accent text-accent-foreground')}
        >
          <CheckCircle className="w-4 h-4 mr-2" /> Approve
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleVote('rejected')}
          disabled={!!voted}
          className={cn(voted === 'rejected' && 'bg-destructive text-destructive-foreground')}
        >
          <XCircle className="w-4 h-4 mr-2" /> Reject
        </Button>
      </CardFooter>
    </Card>
  );
}
