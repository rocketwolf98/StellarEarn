#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    token, Address, Env, String, Vec, symbol_short,
};

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum Status {
    Open,
    UnderReview,
    Completed,
    Cancelled,
    Expired,
}

#[contracttype]
#[derive(Clone)]
pub struct Bounty {
    pub id: u64,
    pub sponsor: Address,
    pub token: Address,
    pub prize: i128,
    pub submission_fee: i128,
    pub deadline: u64,
    pub status: Status,
    pub winner: Option<Address>,
}

#[contracttype]
#[derive(Clone)]
pub struct Submission {
    pub contributor: Address,
    pub work_hash: String,
}

#[contracttype]
pub enum DataKey {
    Bounty(u64),
    Submissions(u64),
    Counter,
    PlatformFees,
}

#[contract]
pub struct BountyContract;

#[contractimpl]
impl BountyContract {

    // =========================
    // INIT
    // =========================
    pub fn init(env: Env) {
        if env.storage().instance().has(&DataKey::Counter) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Counter, &0u64);
        env.storage().instance().set(&DataKey::PlatformFees, &0i128);
    }

    // =========================
    // CREATE BOUNTY (SPONSOR)
    // =========================
    pub fn create_bounty(
        env: Env,
        sponsor: Address,
        token: Address,
        prize: i128,
        deadline: u64,
    ) -> u64 {

        sponsor.require_auth();

        assert!(prize > 0, "invalid prize");
        assert!(deadline > env.ledger().timestamp(), "invalid deadline");

        let mut id: u64 = env.storage().instance().get(&DataKey::Counter).unwrap();
        id += 1;

        let bounty = Bounty {
            id,
            sponsor: sponsor.clone(),
            token: token.clone(),
            prize,
            submission_fee: 0, // set later or fixed globally
            deadline,
            status: Status::Open,
            winner: None,
        };

        // Sponsor deposits prize into contract (escrow)
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(
            &sponsor,
            &env.current_contract_address(),
            &prize,
        );

        env.storage().persistent().set(&DataKey::Bounty(id), &bounty);
        env.storage().persistent().set(&DataKey::Submissions(id), &Vec::<Submission>::new(&env));
        env.storage().instance().set(&DataKey::Counter, &id);

        env.events().publish((symbol_short!("CREATE"), id), sponsor);

        id
    }

    // =========================
    // SUBMIT (PARTICIPANT + 10 XLM FEE)
    // =========================
    pub fn submit(
        env: Env,
        bounty_id: u64,
        participant: Address,
        work_hash: String,
    ) {

        participant.require_auth();

        let mut bounty: Bounty =
            env.storage().persistent().get(&DataKey::Bounty(bounty_id))
                .expect("bounty not found");

        assert!(bounty.status == Status::Open || bounty.status == Status::UnderReview, "not active");
        assert!(env.ledger().timestamp() < bounty.deadline, "expired");

        // FIXED PLATFORM FEE = 10 XLM
        let fee: i128 = 10_0000000; // 10 XLM (7 decimals)

        let token_client = token::Client::new(&env, &bounty.token);

        // participant pays fee to contract
        token_client.transfer(
            &participant,
            &env.current_contract_address(),
            &fee,
        );

        // track platform fees
        let mut pf: i128 =
            env.storage().instance().get(&DataKey::PlatformFees).unwrap_or(0);
        pf += fee;
        env.storage().instance().set(&DataKey::PlatformFees, &pf);

        // store submission
        let mut submissions: Vec<Submission> =
            env.storage().persistent().get(&DataKey::Submissions(bounty_id))
                .unwrap();

        submissions.push_back(Submission {
            contributor: participant.clone(),
            work_hash,
        });

        env.storage().persistent().set(&DataKey::Submissions(bounty_id), &submissions);

        if bounty.status == Status::Open {
            bounty.status = Status::UnderReview;
            env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);
        }

        env.events().publish((symbol_short!("SUBMIT"), bounty_id), participant);
    }

    // =========================
    // SELECT WINNER (SPONSOR)
    // =========================
    pub fn select_winner(
        env: Env,
        bounty_id: u64,
        sponsor: Address,
        winner: Address,
    ) {

        sponsor.require_auth();

        let mut bounty: Bounty =
            env.storage().persistent().get(&DataKey::Bounty(bounty_id))
                .expect("not found");

        assert!(bounty.sponsor == sponsor, "not sponsor");
        assert!(bounty.winner.is_none(), "already selected");

        let submissions: Vec<Submission> =
            env.storage().persistent().get(&DataKey::Submissions(bounty_id))
                .unwrap();

        assert!(
            submissions.iter().any(|s| s.contributor == winner),
            "winner not submitted"
        );

        bounty.winner = Some(winner.clone());
        bounty.status = Status::Completed;

        env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);

        // release prize
        let token_client = token::Client::new(&env, &bounty.token);
        token_client.transfer(
            &env.current_contract_address(),
            &winner,
            &bounty.prize,
        );

        env.events().publish((symbol_short!("WIN"), bounty_id), winner);
    }

    // =========================
    // CANCEL (SPONSOR ONLY, BEFORE SUBMISSIONS)
    // =========================
    pub fn cancel(env: Env, bounty_id: u64, sponsor: Address) {

        sponsor.require_auth();

        let bounty: Bounty =
            env.storage().persistent().get(&DataKey::Bounty(bounty_id))
                .unwrap();

        assert!(bounty.sponsor == sponsor, "not sponsor");

        let submissions: Vec<Submission> =
            env.storage().persistent().get(&DataKey::Submissions(bounty_id))
                .unwrap();

        assert!(submissions.is_empty(), "has submissions");

        let token_client = token::Client::new(&env, &bounty.token);
        token_client.transfer(
            &env.current_contract_address(),
            &sponsor,
            &bounty.prize,
        );

        env.storage().persistent().set(&DataKey::Bounty(bounty_id), &Bounty {
            status: Status::Cancelled,
            ..bounty
        });

        env.events().publish((symbol_short!("CANCEL"), bounty_id), sponsor);
    }

    // =========================
    // WITHDRAW PLATFORM FEES
    // =========================
    pub fn withdraw_fees(env: Env, admin: Address, token: Address) {

        admin.require_auth();

        let fees: i128 =
            env.storage().instance().get(&DataKey::PlatformFees).unwrap_or(0);

        assert!(fees > 0, "no fees");

        let token_client = token::Client::new(&env, &token);

        token_client.transfer(
            &env.current_contract_address(),
            &admin,
            &fees,
        );

        env.storage().instance().set(&DataKey::PlatformFees, &0i128);
    }

    // =========================
    // VIEW
    // =========================
    pub fn get_bounty(env: Env, id: u64) -> Bounty {
        env.storage().persistent().get(&DataKey::Bounty(id)).unwrap()
    }

    pub fn get_submissions(env: Env, id: u64) -> Vec<Submission> {
        env.storage().persistent().get(&DataKey::Submissions(id)).unwrap()
    }

    pub fn platform_fees(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::PlatformFees).unwrap_or(0)
    }
}