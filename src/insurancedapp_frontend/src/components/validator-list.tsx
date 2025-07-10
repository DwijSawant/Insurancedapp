
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { insurancedapp_backend } from '../../../declarations/insurancedapp_backend';
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
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
  const [open, setOpen] = useState(false);

  const handleStake = async () => {
    try {
      await insurancedapp_backend.register_validator(); // backend call
      setUserStatus(prev => ({
        ...prev,
        isValidator: true,
        stakedAmount: 100,
      }));
      setOpen(false);
    } catch (error) {
      console.error("Failed to register as validator:", error);
      alert("Already registered or error occurred.");
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
                Stake $100 to help secure the network and earn rewards. Click confirm to become a validator.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" onClick={handleStake}>Confirm Stake</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
