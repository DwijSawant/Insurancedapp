import { useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { insurancedapp_backend } from 'declarations/insurancedapp_backend';

const App = () => {
  const [identity, setIdentity] = useState(null);
  const [claims, setClaims] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const claims = await insurancedapp_backend.get_claims();
      const investors = await insurancedapp_backend.get_investors();
      const subscribers = await insurancedapp_backend.get_subscribers();
      setClaims(claims);
      setInvestors(investors);
      setSubscribers(subscribers);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const login = async () => {
    const authClient = await AuthClient.create();
    await authClient.login({
      identityProvider: 'https://identity.ic0.app/#authorize',
      onSuccess: async () => {
        const identity = authClient.getIdentity();
        setIdentity(identity);
        // Note: If you need identity-bound actors, use `createActor(canisterId, { agentOptions: { identity } })`
        await loadInitialData();
      },
    });
  };

  const submitClaim = async () => {
    if (!identity) {
      alert("Please login first");
      return;
    }
    try {
      await insurancedapp_backend.submit_claim(description, BigInt(amount));
      alert("Claim submitted!");
      loadInitialData();
    } catch (err) {
      alert("Error submitting claim");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Insurance dApp</h1>

      {!identity ? (
        <button onClick={login} className="bg-blue-600 text-white px-4 py-2 rounded">Login with Internet Identity</button>
      ) : (
        <>
          <div className="my-4">
            <h2 className="text-xl font-semibold">Submit Claim</h2>
            <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="border px-2 py-1 mr-2" />
            <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="border px-2 py-1 mr-2" />
            <button onClick={submitClaim} className="bg-green-600 text-white px-4 py-2 rounded">Submit</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Claims</h2>
              {claims.map((claim) => (
                <div key={claim.id} className="bg-white p-2 border mb-2 rounded">
                  <p><strong>ID:</strong> {claim.id.toString()}</p>
                  <p><strong>Description:</strong> {claim.description}</p>
                  <p><strong>Approvals:</strong> {claim.approvals.toString()}</p>
                  <p><strong>Total Votes:</strong> {claim.total_votes.toString()}</p>
                  <p><strong>Executed:</strong> {claim.executed ? 'Yes' : 'No'}</p>
                  <p><strong>Amount:</strong> {claim.amount.toString()}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Investors</h2>
              {investors.map((inv) => (
                <div key={inv.id.toString()} className="bg-white p-2 border mb-2 rounded">
                  <p><strong>Investor:</strong> {inv.id.toString()}</p>
                  <p><strong>Amount:</strong> {inv.invested_amount.toString()}</p>
                </div>
              ))}

              <h2 className="text-xl font-semibold mt-4 mb-2">Subscribers</h2>
              {subscribers.map((sub) => (
                <div key={sub.id.toString()} className="bg-white p-2 border mb-2 rounded">
                  <p><strong>Subscriber:</strong> {sub.id.toString()}</p>
                  <p><strong>Amount Paid:</strong> {sub.amount_paid.toString()}</p>
                  <p><strong>Last Paid:</strong> {sub.last_payment_timestamp.toString()}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;