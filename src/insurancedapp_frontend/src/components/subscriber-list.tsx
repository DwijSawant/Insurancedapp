
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { insurancedapp_backend } from '../../../declarations/insurancedapp_backend';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import type { UserStatus } from '@/lib/types';
import type { Claim } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SubscriberListProps = {
  userStatus: UserStatus;
  setUserStatus: React.Dispatch<React.SetStateAction<UserStatus>>;
  onAddClaim: (newClaim: Omit<Claim, 'id' | 'status' | 'recipient'>) => void;
};

export function SubscriberList({ userStatus, setUserStatus, onAddClaim }: SubscriberListProps) {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimAmount, setClaimAmount] = useState('1000');
  const [claimDescription, setClaimDescription] = useState('');
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      const amount = 100; // hardcoded or dynamic if needed
      const timestamp = BigInt(Date.now());
      await insurancedapp_backend.subscribe(BigInt(amount), timestamp);

      setUserStatus(prev => ({
        ...prev,
        isSubscriber: true,
      }));
      setSubscribeOpen(false);
    } catch (e) {
      console.error("Subscription failed:", e);
      alert("Subscription failed. See console for details.");
    }
  };

  const handleClaimSubmit = async () => {
    const amount = parseInt(claimAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid claim amount.",
        variant: "destructive",
      });
      return;
    }
    if (!claimDescription.trim()) {
      toast({
        title: "Missing Description",
        description: "Please provide a description for your claim.",
        variant: "destructive",
      });
      return;
    }

    try {
      await insurancedapp_backend.submit_claim(claimDescription, BigInt(amount));
    
    // You can still keep local state for UI purposes
      onAddClaim({ amount, description: claimDescription });

      toast({
        title: "Claim Submitted",
        description: "Your claim has been submitted for review.",
      });

      setClaimAmount('1000');
      setClaimDescription('');
      setClaimOpen(false);
    } catch (e) {
      console.error("Claim submission failed:", e);
      toast({
        title: "Submission Failed",
        description: "An error occurred while submitting the claim.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div>
      <div className="flex justify-end mb-4 gap-2">
        {userStatus.isSubscriber ? (
          <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
            <DialogTrigger asChild>
              <Button>Raise a Claim</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Raise a Claim</DialogTitle>
                <DialogDescription>
                  Submit a new claim for review. Please provide all necessary
                  details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="claim-amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="claim-amount"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    className="col-span-3"
                    type="number"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label
                    htmlFor="claim-description"
                    className="text-right pt-2"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="claim-description"
                    value={claimDescription}
                    onChange={(e) => setClaimDescription(e.target.value)}
                    placeholder="Please describe your claim in detail."
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="button" onClick={handleClaimSubmit}>Submit Claim</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={subscribeOpen} onOpenChange={setSubscribeOpen}>
            <DialogTrigger asChild>
              <Button>Subscribe Now</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Subscribe to a Policy</DialogTitle>
                <DialogDescription>
                  Get covered by our community-driven insurance. Click confirm to
                  subscribe.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" onClick={handleSubscribe}>Confirm Subscription</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {userStatus.isSubscriber && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="text-green-500" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">Your subscription is active.</p>
            <p className="text-sm text-muted-foreground">You are covered and can now raise claims.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
