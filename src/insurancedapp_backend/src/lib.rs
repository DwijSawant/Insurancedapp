// src/insurance_backend/lib.rs
//neeed to integrate this with internet identity.
use ic_cdk::storage;
use ic_cdk_macros::*;
use candid::{CandidType, Deserialize};
use std::collections::HashMap;
use std::cell::RefCell;
use ic_cdk::update;
use ic_cdk::init;
use ic_cdk::query;

#[derive(CandidType, Deserialize, Clone)]
pub struct Claim {
    pub id: u64,
    pub description: String,
    pub approvals: u64,
    pub total_votes: u64,
    pub executed: bool,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct Validator {
    pub stake: u64,
    pub has_voted_for: Vec<u64>, // claim IDs
}

#[derive(CandidType, Deserialize, Clone)]
pub struct Subscriber {
    pub name: String,
    pub subscribed: bool,
    pub last_payment_timestamp: u64,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct Investor {
    pub name: String,
    pub invested_amount: u64,
}

thread_local! {
    static CLAIMS: RefCell<HashMap<u64, Claim>> = RefCell::new(HashMap::new());
    static VALIDATORS: RefCell<HashMap<String, Validator>> = RefCell::new(HashMap::new());
    static SUBSCRIBERS: RefCell<HashMap<String, Subscriber>> = RefCell::new(HashMap::new());
    static INVESTORS: RefCell<HashMap<String, Investor>> = RefCell::new(HashMap::new());
    static CLAIM_COUNTER: RefCell<u64> = RefCell::new(0);
}

#[init]
fn init() {}

#[update]
fn register_validator(name: String, stake: u64) {  //need to have a minimum stake amount...will make it fixed so no input will keep it high
    VALIDATORS.with(|v| {
        v.borrow_mut().insert(name.clone(), Validator {
            stake,
            has_voted_for: vec![],
        });
    });
}

#[update]
fn submit_claim(description: String) -> u64 {
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
        });
    });

    claim_id
}

#[update]
fn vote_on_claim(name: String, claim_id: u64, approve: bool) {
    VALIDATORS.with(|v_store| {
        let mut validators = v_store.borrow_mut();
        let validator = validators.get_mut(&name);

        if let Some(v) = validator {
            if v.has_voted_for.contains(&claim_id) {
                return;
            }
            v.has_voted_for.push(claim_id);

            CLAIMS.with(|c| {
                let mut claims = c.borrow_mut();
                if let Some(claim) = claims.get_mut(&claim_id) {
                    claim.total_votes += 1;
                    if approve {
                        claim.approvals += 1;
                    }
                    if !claim.executed && claim.total_votes >= 3 && (claim.approvals as f64 / claim.total_votes as f64) >= 0.51 {
                        claim.executed = true;
                    } //FALSE VOTE MECHANIC NEED TO MAKE IT MAJORITY ...% and when executed it should send money to claim id 1 address 
                    //on approval % from the contract wallet should be sent to claim address
                }
            });
        }
    });
}

#[update]
fn subscribe(name: String, timestamp: u64) {
    SUBSCRIBERS.with(|subs| {
        subs.borrow_mut().insert(name.clone(), Subscriber {
            name,
            subscribed: true,
            last_payment_timestamp: timestamp,
        });
    });
}

#[update]
fn invest(name: String, amount: u64) {
    INVESTORS.with(|inv| {
        let mut investors = inv.borrow_mut();
        let entry = investors.entry(name.clone()).or_insert(Investor {
            name,
            invested_amount: 0,
        });
        entry.invested_amount += amount;
    });
}

// Utility: for frontend use
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
