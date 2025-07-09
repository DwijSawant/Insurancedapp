export interface Investor {
  id: number;
  name: string;
  investment: number;
}

export interface Subscriber {
  id: number;
  name: string;
  paymentStatus: 'Paid' | 'Due';
}

export interface Validator {
  id: number;
  name: string;
  stake: number;
}

export interface Claim {
  id: number;
  description: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  recipient: string;
}

export const investors: Investor[] = [
  { id: 1, name: 'Alice Capital', investment: 50000 },
  { id: 2, name: 'Bob Ventures', investment: 75000 },
  { id: 3, name: 'Charlie Funds', investment: 30000 },
  { id: 4, name: 'Diana Holdings', investment: 120000 },
  { id: 5, name: 'Eve Investments', investment: 80000 },
];

export const subscribers: Subscriber[] = [
  { id: 1, name: 'Frank Miller', paymentStatus: 'Paid' },
  { id: 2, name: 'Grace Lee', paymentStatus: 'Paid' },
  { id: 3, name: 'Heidi Turner', paymentStatus: 'Due' },
  { id: 4, name: 'Ivan Petrov', paymentStatus: 'Paid' },
];

export const validators: Validator[] = [
  { id: 1, name: 'Validator One', stake: 10000 },
  { id: 2, name: 'Validator Two', stake: 15000 },
  { id: 3, name: 'Validator Three', stake: 12000 },
  { id: 4, name: 'Validator Four', stake: 20000 },
];

export const claims: Claim[] = [
  {
    id: 1,
    description: 'Home damage due to flooding.',
    amount: 15000,
    status: 'Pending',
    recipient: 'Frank Miller',
  },
  {
    id: 2,
    description: 'Vehicle accident claim.',
    amount: 7500,
    status: 'Pending',
    recipient: 'Grace Lee',
  },
  {
    id: 3,
    description: 'Lost luggage during travel.',
    amount: 1200,
    status: 'Approved',
    recipient: 'John Doe',
  },
    {
    id: 4,
    description: 'Medical emergency coverage.',
    amount: 5000,
    status: 'Rejected',
    recipient: 'Jane Smith',
  },
];
