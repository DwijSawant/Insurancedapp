
export type UserStatus = {
  isLoggedIn: boolean;
  isValidator: boolean;
  isSubscriber: boolean;
  isInvestor: boolean;
  stakedAmount: number | null;
  investedAmount: number | null;
};
