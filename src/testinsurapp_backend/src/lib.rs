use ic_cdk_macros::*;
use ic_cdk::storage;
use candid::{CandidType, Deserialize};
use std::collections::HashMap;
use std::cell::RefCell;
use ic_cdk::{caller, query, update, trap};
use ic_cdk::init;


#[derive(CandidType, Deserialize, Clone)]
pub struct Claim {
    pub id: u64,
    pub description: String,
    pub approvals: u64,
    pub total_votes: u64,
    pub executed: bool,
    pub recipient: String,
    pub amount: u64,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct Validator {
    pub stake: u64,
    pub has_voted_for: Vec<u64>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct Subscriber {
    pub id: String,
    pub subscribed: bool,
    pub last_payment_timestamp: u64,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct Investor {
    pub id: String,
    pub invested_amount: u64,
}

thread_local! {
    static CLAIMS: RefCell<HashMap<u64, Claim>> = RefCell::new(HashMap::new());
    static VALIDATORS: RefCell<HashMap<String, Validator>> = RefCell::new(HashMap::new());
    static SUBSCRIBERS: RefCell<HashMap<String, Subscriber>> = RefCell::new(HashMap::new());
    static INVESTORS: RefCell<HashMap<String, Investor>> = RefCell::new(HashMap::new());
    static BALANCES: RefCell<HashMap<String, u64>> = RefCell::new(HashMap::new());
    static CLAIM_COUNTER: RefCell<u64> = RefCell::new(0);
    static CONTRACT_BALANCE: RefCell<u64> = RefCell::new(0);
}

#[init]
fn init() {
    // Any startup logic
}


#[update]
fn register_validator() {
    const MIN_VALIDATOR_STAKE: u64 = 1000;
    let caller_id = caller().to_text();

    VALIDATORS.with(|v| {
        let mut validators = v.borrow_mut();
        if validators.contains_key(&caller_id) {
            trap("Already registered as a validator.");
        }

        validators.insert(caller_id, Validator {
            stake: MIN_VALIDATOR_STAKE,
            has_voted_for: vec![],
        });
    });
}

#[update]
fn deposit_tokens(amount: u64) {
    let caller_id = caller().to_text();
    BALANCES.with(|b| {
        let mut balances = b.borrow_mut();
        let entry = balances.entry(caller_id.clone()).or_insert(0);
        *entry += amount;
    });
}

#[update]
fn invest(amount: u64) {
    let caller_id = caller().to_text();

    BALANCES.with(|b| {
        let mut balances = b.borrow_mut();
        let entry = balances.entry(caller_id.clone()).or_insert(0);
        if *entry < amount {
            trap("Insufficient balance.");
        }
        *entry -= amount;
    });

    INVESTORS.with(|inv| {
        let mut investors = inv.borrow_mut();
        let entry = investors.entry(caller_id.clone()).or_insert(Investor {
            id: caller_id.clone(),
            invested_amount: 0,
        });
        entry.invested_amount += amount;
    });

    CONTRACT_BALANCE.with(|cb| *cb.borrow_mut() += amount);
}

#[update]
fn subscribe(timestamp: u64) {
    const SUBSCRIPTION_FEE: u64 = 100000;
    let caller_id = caller().to_text();

    BALANCES.with(|b| {
        let mut balances = b.borrow_mut();
        let entry = balances.entry(caller_id.clone()).or_insert(0);
        if *entry < SUBSCRIPTION_FEE {
            trap("Insufficient balance to subscribe.");
        }
        *entry -= SUBSCRIPTION_FEE;
    });

    CONTRACT_BALANCE.with(|cb| *cb.borrow_mut() += SUBSCRIPTION_FEE);

    SUBSCRIBERS.with(|subs| {
        subs.borrow_mut().insert(caller_id.clone(), Subscriber {
            id: caller_id,
            subscribed: true,
            last_payment_timestamp: timestamp,
        });
    });
}

#[update]
fn submit_claim(description: String, amount: u64) -> u64 {
    let recipient = caller().to_text();

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

#[update]
fn vote_on_claim(claim_id: u64, approve: bool) {
    let caller_id = caller().to_text();

    VALIDATORS.with(|v_store| {
        let mut validators = v_store.borrow_mut();
        let validator = validators.get_mut(&caller_id);

        if let Some(v) = validator {
            if v.has_voted_for.contains(&claim_id) {
                trap("Already voted.");
            }
            v.has_voted_for.push(claim_id);

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
                        CONTRACT_BALANCE.with(|cb| {
                            let mut contract_tokens = cb.borrow_mut();
                            if *contract_tokens < claim.amount {
                                trap("Contract has insufficient funds.");
                            }

                            BALANCES.with(|b| {
                                let mut balances = b.borrow_mut();
                                let receiver = balances.entry(claim.recipient.clone()).or_insert(0);
                                *receiver += claim.amount;
                            });

                            *contract_tokens -= claim.amount;
                            claim.executed = true;
                        });
                    }
                }
            });
        }
    });
}

#[query]
fn get_balance() -> u64 {
    let caller_id = caller().to_text();
    BALANCES.with(|b| *b.borrow().get(&caller_id).unwrap_or(&0))
}

#[query]
fn get_contract_balance() -> u64 {
    CONTRACT_BALANCE.with(|cb| *cb.borrow())
}

#[query]
fn get_claims() -> Vec<Claim> {
    CLAIMS.with(|c| c.borrow().values().cloned().collect())
}

#[query]
fn get_subscribers() -> Vec<Subscriber> {
    SUBSCRIBERS.with(|s| s.borrow().values().cloned().collect())
}

#[query]
fn get_investors() -> Vec<Investor> {
    INVESTORS.with(|i| i.borrow().values().cloned().collect())
}
