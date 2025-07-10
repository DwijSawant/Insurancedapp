import { useState } from 'react';
import { Button } from './ui/button';
import { insurancedapp_backend } from '../../../declarations/insurancedapp_backend';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { UserStatus } from '@/lib/types';

type InvestorListProps = {
  userStatus: UserStatus;
  setUserStatus: React.Dispatch<React.SetStateAction<UserStatus>>;
};

export function InvestorList({ userStatus, setUserStatus }: InvestorListProps) {
  const [investment, setInvestment] = useState('10000');
  const [open, setOpen] = useState(false);

  const handleInvest = async () => {
    const amount = parseInt(investment, 10);

    if (!isNaN(amount) && amount > 0) {
      try {
        await insurancedapp_backend.invest(BigInt(amount));
        setUserStatus(prev => ({
          ...prev,
          isInvestor: true,
          investedAmount: (prev.investedAmount || 0) + amount,
        }));
        setOpen(false);
      } catch (e) {
        console.error("Investment failed:", e);
        alert("Investment failed. Check console.");
      }
    } else {
      alert("Please enter a valid amount.");
    }
  };

  if (userStatus.isInvestor) {
    return (
      <>
        <div className="flex justify-end mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Invest More</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invest in SecureLeap</DialogTitle>
                <DialogDescription>
                  Support the platform and earn a return on your investment.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="investment" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="investment"
                    value={investment}
                    onChange={(e) => setInvestment(e.target.value)}
                    className="col-span-3"
                    type="number"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleInvest}>Confirm Investment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Your Investment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              Total Amount Invested: {userStatus.investedAmount?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
            <p className="text-sm text-muted-foreground">Thank you for supporting SecureLeap.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Invest Now</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invest in SecureLeap</DialogTitle>
              <DialogDescription>
                Support the platform and earn a return on your investment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="investment" className="text-right">
                  Amount
                </Label>
                <Input
                  id="investment"
                  value={investment}
                  onChange={(e) => setInvestment(e.target.value)}
                  className="col-span-3"
                  type="number"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleInvest}>Confirm Investment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
