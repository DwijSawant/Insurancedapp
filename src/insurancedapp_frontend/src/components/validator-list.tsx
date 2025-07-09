
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserStatus } from '@/lib/types';

type ValidatorListProps = {
  userStatus: UserStatus;
  setUserStatus: React.Dispatch<React.SetStateAction<UserStatus>>;
};

export function ValidatorList({ userStatus, setUserStatus }: ValidatorListProps) {
  const [stake, setStake] = useState('10000');
  const [open, setOpen] = useState(false);

  const handleStake = () => {
    const stakeAmount = parseInt(stake, 10);
    if (!isNaN(stakeAmount) && stakeAmount > 0) {
      setUserStatus(prev => ({
        ...prev,
        isValidator: true,
        stakedAmount: stakeAmount,
      }));
      setOpen(false);
    }
  };

  if (userStatus.isValidator) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Staking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">
            Amount Staked: {userStatus.stakedAmount?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
          <p className="text-sm text-muted-foreground">Thank you for helping secure the network.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Sign Up as Validator</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Become a Validator</DialogTitle>
              <DialogDescription>
                Stake your assets to help secure the network and earn rewards.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stake" className="text-right">
                  Stake Amount
                </Label>
                <Input
                  id="stake"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  className="col-span-3"
                  type="number"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleStake}>Confirm Stake</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
