
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import type { UserStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle } from 'lucide-react';

type SubscriberListProps = {
  userStatus: UserStatus;
  setUserStatus: React.Dispatch<React.SetStateAction<UserStatus>>;
};

export function SubscriberList({ userStatus, setUserStatus }: SubscriberListProps) {
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  const handleSubscribe = () => {
    setUserStatus(prev => ({
      ...prev,
      isSubscriber: true,
    }));
    setSubscribeOpen(false);
  };
  
  return (
    <div>
      <div className="flex justify-end mb-4 gap-2">
        {userStatus.isSubscriber ? (
          <Dialog>
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
                    defaultValue="1000"
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
                    placeholder="Please describe your claim in detail."
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Submit Claim</Button>
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
