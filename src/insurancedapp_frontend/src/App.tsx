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
import type { Claim } from '@/lib/data';
import { claims as initialClaims } from '@/lib/data';
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { Identity } from '@dfinity/agent';
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
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus>(initialUserStatus);
  const [claims, setClaims] = useState<Claim[]>(initialClaims);

  const handleLoginToggle = async (loggedIn: boolean) => {
    if (loggedIn) {
      const client = await AuthClient.create();
      await client.login({
        identityProvider: "https://identity.ic0.app/#authorize",  //CHECK THIS FOR LOCAL DEPLOYMENT LEDGER 
        onSuccess: async () => {
          const identity = client.getIdentity();
          setIdentity(identity);
          setAuthClient(client);
          setUserStatus(prev => ({ ...prev, isLoggedIn: true }));
        },
        onError: (err) => {
          console.error("Login failed", err);
        }
      });
    } else {
      if (authClient) {
        await authClient.logout();
      }
      setIdentity(null);
      setAuthClient(null);
      setUserStatus(initialUserStatus);
      setClaims(initialClaims);
    }
  };


  const handleAddClaim = (newClaim: Omit<Claim, 'id' | 'status' | 'recipient'>) => {
    setClaims(prevClaims => [
      {
        ...newClaim,
        id: prevClaims.length + 1,
        status: 'Pending',
        recipient: 'Current User', // Placeholder for actual user data
      },
      ...prevClaims,
    ]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header isLoggedIn={userStatus.isLoggedIn} onLoginToggle={handleLoginToggle} />
      <main className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-500">
        {userStatus.isLoggedIn ? (
          <Dashboard userStatus={userStatus} setUserStatus={setUserStatus} claims={claims} onAddClaim={handleAddClaim} />          
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




const Dashboard = ({
  userStatus,
  setUserStatus,
  claims,
  onAddClaim
}: {
  userStatus: UserStatus;
  setUserStatus: React.Dispatch<React.SetStateAction<UserStatus>>;
  claims: Claim[];
  onAddClaim: (newClaim: Omit<Claim, 'id' | 'status' | 'recipient'>) => void;
}) => (
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
          <ClaimsList claims={claims} />
        </TabsContent>
      )}
      <TabsContent value="validators" className="mt-6">
        <ValidatorList userStatus={userStatus} setUserStatus={setUserStatus} />
      </TabsContent>
      <TabsContent value="subscribers" className="mt-6">
        <SubscriberList userStatus={userStatus} setUserStatus={setUserStatus} onAddClaim={onAddClaim} />
      </TabsContent>
      <TabsContent value="investors" className="mt-6">
        <InvestorList userStatus={userStatus} setUserStatus={setUserStatus} />
      </TabsContent>
    </Tabs>
  </div>
);


