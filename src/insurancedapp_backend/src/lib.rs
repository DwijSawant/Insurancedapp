use ic_cdk_macros::*;
use ic_cdk::{caller, trap};
use candid::{CandidType, Deserialize, Principal};
use std::collections::HashMap;
use std::cell::RefCell;
use icrc_ledger_types::icrc1::account::{Account, Subaccount as IcrcSubaccount};
use icrc_ledger_types::icrc1::transfer::{BlockIndex, Memo as IcrcMemo, NumTokens, TransferArg, TransferError as IcrcTransferError};
use ic_cdk::call::{Call, CallErrorExt};



//Define universal data structures for all types of function
#[derive(CandidType, Deserialize, Clone)]
pub struct Claim {
    pub id: u64,
    pub description: String,
    pub approvals: u64,
    pub total_votes: u64,
    pub executed: bool,
    pub recipient: Principal,
    pub amount: u64,
}


// declaring validator struct
#[derive(CandidType, Deserialize, Clone)]
pub struct Validator {
    pub stake: u64,
    pub has_voted_for: Vec<u64>,
}


//declaring subscriber struct
#[derive(CandidType, Deserialize, Clone)]
pub struct Subscriber {
    pub id: Principal,
    pub subscribed: bool,
    pub last_payment_timestamp: u64,
    pub amount_paid: u64,
}


//declaring investor struct
#[derive(CandidType, Deserialize, Clone)]
pub struct Investor {
    pub id: Principal,
    pub invested_amount: u64,
}

thread_local! {
    static CLAIMS: RefCell<HashMap<u64, Claim>> = RefCell::new(HashMap::new());
    static VALIDATORS: RefCell<HashMap<Principal, Validator>> = RefCell::new(HashMap::new());
    static SUBSCRIBERS: RefCell<HashMap<Principal, Subscriber>> = RefCell::new(HashMap::new());
    static INVESTORS: RefCell<HashMap<Principal, Investor>> = RefCell::new(HashMap::new());
    static CLAIM_COUNTER: RefCell<u64> = RefCell::new(0);
}


//transaction function for icp
pub async fn icp_transfer(
    from_subaccount: Option<IcrcSubaccount>,
    to: Account,
    memo: Option<Vec<u8>>,
    amount: NumTokens,
) -> Result<BlockIndex, String> {
    const ICP_LEDGER_CANISTER_ID: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai"; //local deployed ledger change it to mainnet before using on mainnet
    let icp_ledger = Principal::from_text(ICP_LEDGER_CANISTER_ID).unwrap();
    let args = TransferArg {
        memo: memo.map(IcrcMemo::from),
        to,
        amount,
        from_subaccount,
        fee: Some(NumTokens::from(10_000_u32)),
        created_at_time: None,
    };

    match Call::unbounded_wait(icp_ledger, "icrc1_transfer")
        .with_arg(&args)
        .await
    {
        Ok(res) => match res.candid::<Result<BlockIndex, IcrcTransferError>>() {
            Ok(Ok(block_index)) => Ok(block_index),
            Ok(Err(e)) => Err(format!("Ledger returned an error: {:?}", e)),
            Err(e) => Err(format!("Error decoding ledger response: {:?}", e)),
        },
        Err(e) if !e.is_clean_reject() => Err(format!("Unclean reject: {:?}", e)),
        Err(e) => Err(format!("Clean reject: {:?}", e)),
    }
}


//initialilse init
#[init]
fn init() {}



//input funct for validator registration
#[update]
async fn register_validator() {
    const STAKE_AMOUNT: u64 = 100;
    let caller_id = caller();

    let account = Account {
        owner: ic_cdk::id(),
        subaccount: None,
    };

    match icp_transfer(Some([0u8; 32]), account, Some(b"validator_stake".to_vec()), NumTokens::from(STAKE_AMOUNT)).await {
        Ok(_) => {
            VALIDATORS.with(|v| {
                let mut validators = v.borrow_mut();
                if validators.contains_key(&caller_id) {
                    trap("Already registered as a validator.");
                }
                validators.insert(caller_id, Validator {
                    stake: STAKE_AMOUNT,
                    has_voted_for: vec![],
                });
            });
        }
        Err(e) => trap(&format!("Stake transfer failed: {:?}", e)),
    }
}


//input function for investor registration
#[update]
async fn invest(amount: u64) {
    let caller_id = caller();
    let account = Account {
        owner: ic_cdk::id(),
        subaccount: None,
    };

    match icp_transfer(None, account, Some(b"investment".to_vec()), NumTokens::from(amount)).await {
        Ok(_) => {
            INVESTORS.with(|inv| {
                let mut investors = inv.borrow_mut();
                let entry = investors.entry(caller_id).or_insert(Investor {
                    id: caller_id,
                    invested_amount: 0,
                });
                entry.invested_amount += amount;
            });
        }
        Err(e) => trap(&format!("Investment transfer failed: {:?}", e)),
    }
}


//input function for subscription
#[update]
async fn subscribe(amount: u64, timestamp: u64) {
    let caller_id = caller();
    let account = Account {
        owner: ic_cdk::id(),
        subaccount: None,
    };

    match icp_transfer(None, account, Some(b"subscription".to_vec()), NumTokens::from(amount)).await {
        Ok(_) => {
            SUBSCRIBERS.with(|subs| {
                subs.borrow_mut().insert(caller_id, Subscriber {
                    id: caller_id,
                    subscribed: true,
                    last_payment_timestamp: timestamp,
                    amount_paid: amount,
                });
            });
        }
        Err(e) => trap(&format!("Subscription payment failed: {:?}", e)),
    }
}


//input function for raising claim for subscribers
#[update]
fn submit_claim(description: String, amount: u64) -> u64 {
    let recipient = caller();

    let claim_id = CLAIM_COUNTER.with(|c| {
        let mut counter = c.borrow_mut();
        *counter += 1;
        *counter
    });

    CLAIMS.with(|claims| {
        claims.borrow_mut().insert(claim_id, Claim {
            id: claim_id,
            description,
            approvals: 0,
            total_votes: 0,
            executed: false,
            recipient,
            amount,
        });
    });

    claim_id
}



//function for validators to vote on the claims raised by subscribers 
#[update]
async fn vote_on_claim(claim_id: u64, approve: bool) {
    let caller_id = caller();

    let should_execute = VALIDATORS.with(|v_store| {
        let mut validators = v_store.borrow_mut();
        if let Some(validator) = validators.get_mut(&caller_id) {
            if validator.has_voted_for.contains(&claim_id) {
                trap("Already voted.");
            }
            validator.has_voted_for.push(claim_id);

            CLAIMS.with(|c| {
                let mut claims = c.borrow_mut();
                if let Some(claim) = claims.get_mut(&claim_id) {
                    if claim.executed {
                        trap("Claim already executed.");
                    }

                    claim.total_votes += 1;
                    if approve {
                        claim.approvals += 1;
                    }

                    if claim.total_votes >= 5 && (claim.approvals as f64 / claim.total_votes as f64) > 0.5 {
                        claim.executed = true;
                        return true;
                    }
                }
                false
            })
        } else {
            trap("Caller is not a validator");
        }
    });

    if should_execute {
        let (recipient, amount) = CLAIMS.with(|c| {
            let claims = c.borrow();
            let claim = claims.get(&claim_id).unwrap();
            (claim.recipient, claim.amount)
        });

        let account = Account {
            owner: recipient,
            subaccount: None,
        };

        match icp_transfer(None, account, Some(claim_id.to_le_bytes().to_vec()), NumTokens::from(amount)).await {
            Ok(block_height) => {
                ic_cdk::println!("Claim paid in block: {}", block_height);
            }
            Err(e) => {
                CLAIMS.with(|c| {
                    let mut claims = c.borrow_mut();
                    if let Some(claim) = claims.get_mut(&claim_id) {
                        claim.executed = false;
                    }
                });
                trap(&format!("ICP transfer failed: {:?}", e));
            }
        }
    }
}




//query function for getting all claims
#[query]
fn get_claims() -> Vec<Claim> {
    CLAIMS.with(|c| c.borrow().values().cloned().collect())
}


//query fuction for subscribers
#[query]
fn get_subscribers() -> Vec<Subscriber> {
    SUBSCRIBERS.with(|s| s.borrow().values().cloned().collect())
}


//query function for investors
#[query]
fn get_investors() -> Vec<Investor> {
    INVESTORS.with(|i| i.borrow().values().cloned().collect())
}
