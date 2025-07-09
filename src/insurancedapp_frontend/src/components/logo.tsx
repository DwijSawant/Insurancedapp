import { ShieldCheck } from 'lucide-react';

export function Logo() {
  return (
    <div className="mr-6 flex items-center space-x-2">
      <ShieldCheck className="h-6 w-6 text-primary" />
      <span className="font-bold inline-block font-headline text-lg">
        SecureLeap
      </span>
    </div>
  );
}
