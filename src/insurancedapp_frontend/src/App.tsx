import { useState } from 'react';
import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvestorList } from '@/components/investor-list';
import { SubscriberList } from '@/components/subscriber-list';
import { ValidatorList } from '@/components/validator-list';
import { ClaimsList } from '@/components/claims-list';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import type { UserStatus } from '@/lib/types';
import '@/index.scss';

const initialUserStatus: UserStatus = {
  isLoggedIn: false,
  isValidator: false,
  isSubscriber: false,
  isInvestor: false,
  stakedAmount: null,
  investedAmount: null,
};

export default function App() {
  const [userStatus, setUserStatus] = useState<UserStatus>(initialUserStatus);

  const handleLoginToggle = (loggedIn: boolean) => {
    if (loggedIn) {
      setUserStatus(prev => ({ ...prev, isLoggedIn: true }));
    } else {
      setUserStatus(initialUserStatus);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header isLoggedIn={userStatus.isLoggedIn} onLoginToggle={handleLoginToggle} />
      <main className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-500">
        {userStatus.isLoggedIn ? (
          <Dashboard userStatus={userStatus} setUserStatus={setUserStatus} />
        ) : (
          <Landing onLogin={() => handleLoginToggle(true)} />
        )}
      </main>
    </div>
  );
}

const Landing = ({ onLogin }: { onLogin: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <ShieldCheck className="w-24 h-24 text-primary" />
    <h1 className="font-headline text-4xl md:text-6xl font-bold mt-4">Welcome to SecureLeap</h1>
    <p className="font-body mt-4 text-lg max-w-2xl text-foreground/80">
      A decentralized insurance platform providing transparent, secure, and community-driven coverage.
      Log in with your Internet Identity to access your dashboard.
    </p>
    <Button onClick={onLogin} className="mt-8 font-headline" size="lg">
      Login with Internet Identity
    </Button>
  </div>
);


const Dashboard = ({ userStatus, setUserStatus }: { userStatus: UserStatus; setUserStatus: React.Dispatch<React.SetStateAction<UserStatus>> }) => (
  <div className="container mx-auto p-4 sm:p-6 lg:p-8 w-full">
     <h1 className="font-headline text-3xl font-bold mb-4">Dashboard</h1>
    <Tabs defaultValue={userStatus.isValidator ? "claims" : "validators"} className="w-full">
      <TabsList className={`grid w-full ${userStatus.isValidator ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'} h-auto`}>
        {userStatus.isValidator && <TabsTrigger value="claims" className="font-headline">Claims</TabsTrigger>}
        <TabsTrigger value="validators" className="font-headline">Validators</TabsTrigger>
        <TabsTrigger value="subscribers" className="font-headline">Subscribers</TabsTrigger>
        <TabsTrigger value="investors" className="font-headline">Investors</TabsTrigger>
      </TabsList>
      {userStatus.isValidator && (
        <TabsContent value="claims" className="mt-6">
          <ClaimsList />
        </TabsContent>
      )}
      <TabsContent value="validators" className="mt-6">
        <ValidatorList userStatus={userStatus} setUserStatus={setUserStatus} />
      </TabsContent>
      <TabsContent value="subscribers" className="mt-6">
        <SubscriberList userStatus={userStatus} setUserStatus={setUserStatus} />
      </TabsContent>
      <TabsContent value="investors" className="mt-6">
        <InvestorList userStatus={userStatus} setUserStatus={setUserStatus} />
      </TabsContent>
    </Tabs>
  </div>
);


