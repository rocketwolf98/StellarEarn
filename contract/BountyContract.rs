#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, String, Vec,
    symbol_short,
};

mod reputation {
    soroban_sdk::contractimport!(
        file = "../reputation_contract.wasm"
    );
}

mod escrow {
    soroban_sdk::contractimport!(
        file = "../escrow_contract.wasm"
    );
}

#[contracttype]
#[derive(Clone, PartialEq, Debug)]
pub enum BountyStatus {
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
    pub poster: Address,
    pub asset: Address,
    pub prize: i128,
    pub submission_fee: i128,
    pub deadline: u64,
    pub skill_tag: String,
    pub status: BountyStatus,
    pub winner: Option<Address>,
    pub placement: Option<BountyPlacement>,
}

#[contracttype]
#[derive(Clone, PartialEq, Debug)]
pub enum BountyPlacement {
    First,
    Second,
    Third,
}

#[contracttype]
#[derive(Clone)]
pub struct Submission {
    pub bounty_id: u64,
    pub contributor: Address,
    pub work_hash: String,
    pub timestamp: u64,
    pub fee_paid: i128,
    pub review_score: Option<u8>,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Bounty(u64),
    Submissions(u64),
    BountyCount,
    Config,
    PendingFees(u64),
    PlatformPendingFees,
}

#[contracttype]
#[derive(Clone)]
pub struct Config {
    pub escrow_contract: Address,
    pub reputation_contract: Address,
    pub submission_fee: i128,
    pub platform_admin: Address,
}

#[contract]
pub struct BountyContract;

#[contractimpl]
impl BountyContract {
    // ─────────────────────────────────────────────
    // INITIALIZATION
    // ─────────────────────────────────────────────
    
    pub fn initialize(
        env: Env,
        platform_admin: Address,
        escrow_contract: Address,
        reputation_contract: Address,
        submission_fee: i128,
    ) {
        if env.storage().instance().has(&DataKey::Config) {
            panic!("already initialized");
        }

        platform_admin.require_auth();

        env.storage().instance().set(
            &DataKey::Config,
            &Config {
                escrow_contract,
                reputation_contract,
                submission_fee,
                platform_admin: platform_admin.clone(),
            },
        );

        env.storage().instance().set(&DataKey::BountyCount, &0u64);
        env.storage().instance().set(&DataKey::PlatformPendingFees, &0i128);
    }

    // ─────────────────────────────────────────────
    // CREATE BOUNTY
    // ─────────────────────────────────────────────
    
    pub fn create_bounty(
        env: Env,
        poster: Address,
        asset: Address,
        prize: i128,
        deadline: u64,
        skill_tag: String,
    ) -> u64 {
        poster.require_auth();

        let config: Config =
            env.storage().instance().get(&DataKey::Config).expect("not init");

        assert!(prize > 0, "invalid prize");
        assert!(deadline > env.ledger().timestamp(), "invalid deadline");

        let count: u64 =
            env.storage().instance().get(&DataKey::BountyCount).unwrap_or(0);

        let bounty_id = count + 1;

        let bounty = Bounty {
            id: bounty_id,
            poster: poster.clone(),
            asset: asset.clone(),
            prize,
            submission_fee: config.submission_fee,
            deadline,
            skill_tag,
            status: BountyStatus::Open,
            winner: None,
            placement: None,
        };

        // Deposit prize to escrow
        let escrow_client = escrow::Client::new(&env, &config.escrow_contract);
        escrow_client.deposit(&bounty_id, &poster, &asset, &prize);

        env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);
        env.storage().persistent().set(
            &DataKey::Submissions(bounty_id),
            &Vec::<Submission>::new(&env),
        );
        env.storage().persistent().set(&DataKey::PendingFees(bounty_id), &0i128);
        env.storage().instance().set(&DataKey::BountyCount, &bounty_id);

        env.events().publish(
            (symbol_short!("CREATE"), bounty_id),
            (poster, prize),
        );

        bounty_id
    }

    // ─────────────────────────────────────────────
    // SUBMIT WORK
    // ─────────────────────────────────────────────
    
    pub fn submit(
        env: Env,
        bounty_id: u64,
        contributor: Address,
        work_hash: String,
    ) {
        contributor.require_auth();

        let mut bounty: Bounty = Self::get_bounty_assert_open(&env, bounty_id);

        assert!(
            env.ledger().timestamp() < bounty.deadline,
            "expired"
        );

        let config: Config =
            env.storage().instance().get(&DataKey::Config).unwrap();

        let mut submissions: Vec<Submission> =
            env.storage().persistent().get(&DataKey::Submissions(bounty_id)).unwrap();

        assert!(
            !submissions.iter().any(|s| s.contributor == contributor),
            "already submitted"
        );

        // Transfer submission fee to contract
        let token = token::Client::new(&env, &bounty.asset);
        token.transfer(
            &contributor,
            &env.current_contract_address(),
            &bounty.submission_fee,
        );

        // Track pending fees
        let mut pending_fees: i128 = env.storage()
            .persistent()
            .get(&DataKey::PendingFees(bounty_id))
            .unwrap_or(0);
        
        pending_fees += bounty.submission_fee;
        env.storage()
            .persistent()
            .set(&DataKey::PendingFees(bounty_id), &pending_fees);

        let mut platform_pending: i128 = env.storage()
            .instance()
            .get(&DataKey::PlatformPendingFees)
            .unwrap_or(0);
        
        platform_pending += bounty.submission_fee;
        env.storage()
            .instance()
            .set(&DataKey::PlatformPendingFees, &platform_pending);

        submissions.push_back(Submission {
            bounty_id,
            contributor: contributor.clone(),
            work_hash: work_hash.clone(),
            timestamp: env.ledger().timestamp(),
            fee_paid: bounty.submission_fee,
            review_score: None,
        });

        env.storage()
            .persistent()
            .set(&DataKey::Submissions(bounty_id), &submissions);

        if bounty.status == BountyStatus::Open {
            bounty.status = BountyStatus::UnderReview;
            env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);
        }

        env.events().publish(
            (symbol_short!("SUBMIT"), bounty_id),
            (contributor, work_hash),
        );
    }

    // ─────────────────────────────────────────────
    // APPROVE WINNER
    // ─────────────────────────────────────────────
    
    pub fn approve(
        env: Env,
        bounty_id: u64,
        winner: Address,
        placement: BountyPlacement,
        review_score: u8,
    ) {
        let mut bounty = Self::get_bounty_assert_open(&env, bounty_id);
        bounty.poster.require_auth();
        
        assert!(bounty.winner.is_none(), "winner already selected");

        let config: Config =
            env.storage().instance().get(&DataKey::Config).unwrap();

        let submissions: Vec<Submission> =
            env.storage().persistent().get(&DataKey::Submissions(bounty_id)).unwrap();

        assert!(
            submissions.iter().any(|s| s.contributor == winner),
            "winner must be a contributor"
        );

        bounty.status = BountyStatus::Completed;
        bounty.winner = Some(winner.clone());
        bounty.placement = Some(placement.clone());

        env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);

        // Release prize
        let escrow_client = escrow::Client::new(&env, &config.escrow_contract);
        escrow_client.release(&bounty_id, &winner);

        // Award reputation
        let rep_client = reputation::Client::new(&env, &config.reputation_contract);
        
        let bounty_placement = match placement {
            BountyPlacement::First => reputation::BountyPlacement::First,
            BountyPlacement::Second => reputation::BountyPlacement::Second,
            BountyPlacement::Third => reputation::BountyPlacement::Third,
        };
        
        rep_client.award_bounty_xp(
            &winner,
            &bounty_placement,
            &bounty.skill_tag,
            &bounty_id,
        );
        
        rep_client.mint_portfolio_nft(
            &winner,
            &bounty_id,
            &String::from_str(&env, &format!("ipfs://bounty/{}", bounty_id)),
        );

        // Award reviewer XP to poster
        rep_client.award_reviewer_xp(
            &bounty.poster,
            &bounty_id,
            &review_score,
        );

        env.events().publish(
            (symbol_short!("APPROVE"), bounty_id),
            (winner, placement),
        );
    }

    // ─────────────────────────────────────────────
    // CANCEL BOUNTY
    // ─────────────────────────────────────────────
    
    pub fn cancel(env: Env, bounty_id: u64) {
        let mut bounty = Self::get_bounty_assert_open(&env, bounty_id);
        bounty.poster.require_auth();

        let submissions: Vec<Submission> =
            env.storage().persistent().get(&DataKey::Submissions(bounty_id)).unwrap();

        assert!(submissions.is_empty(), "cannot cancel bounty with submissions");

        let config: Config =
            env.storage().instance().get(&DataKey::Config).unwrap();

        bounty.status = BountyStatus::Cancelled;
        env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);

        let escrow_client = escrow::Client::new(&env, &config.escrow_contract);
        escrow_client.refund(&bounty_id);

        env.events().publish(
            (symbol_short!("CANCEL"), bounty_id),
            (),
        );
    }

    // ─────────────────────────────────────────────
    // EXPIRE BOUNTY
    // ─────────────────────────────────────────────
    
    pub fn expire(env: Env, bounty_id: u64) {
        let mut bounty: Bounty =
            env.storage().persistent().get(&DataKey::Bounty(bounty_id)).unwrap();

        assert!(env.ledger().timestamp() >= bounty.deadline, "not expired");
        assert!(
            matches!(bounty.status, BountyStatus::Open | BountyStatus::UnderReview),
            "bounty already finalized"
        );

        let config: Config =
            env.storage().instance().get(&DataKey::Config).unwrap();

        bounty.status = BountyStatus::Expired;
        env.storage().persistent().set(&DataKey::Bounty(bounty_id), &bounty);

        // Refund prize
        let escrow_client = escrow::Client::new(&env, &config.escrow_contract);
        escrow_client.refund(&bounty_id);

        // Refund submission fees to contributors
        let pending_fees: i128 = env.storage()
            .persistent()
            .get(&DataKey::PendingFees(bounty_id))
            .unwrap_or(0);
        
        if pending_fees > 0 {
            let submissions: Vec<Submission> =
                env.storage().persistent().get(&DataKey::Submissions(bounty_id)).unwrap();
            
            let token = token::Client::new(&env, &bounty.asset);
            
            for submission in submissions.iter() {
                if submission.fee_paid > 0 {
                    token.transfer(
                        &env.current_contract_address(),
                        &submission.contributor,
                        &submission.fee_paid,
                    );
                }
            }
            
            env.storage()
                .persistent()
                .remove(&DataKey::PendingFees(bounty_id));
            
            let mut platform_pending: i128 = env.storage()
                .instance()
                .get(&DataKey::PlatformPendingFees)
                .unwrap_or(0);
            
            platform_pending -= pending_fees;
            env.storage()
                .instance()
                .set(&DataKey::PlatformPendingFees, &platform_pending);
        }

        env.events().publish(
            (symbol_short!("EXPIRE"), bounty_id),
            (),
        );
    }

    // ─────────────────────────────────────────────
    // CLAIM FEES (Platform Admin)
    // ─────────────────────────────────────────────
    
    pub fn claim_fees(env: Env, platform_admin: Address, bounty_id: u64) {
        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();
        
        platform_admin.require_auth();
        assert!(platform_admin == config.platform_admin, "not platform admin");
        
        let bounty: Bounty = env.storage()
            .persistent()
            .get(&DataKey::Bounty(bounty_id))
            .unwrap();
        
        assert!(matches!(bounty.status, BountyStatus::Completed), "fees only for completed bounties");
        
        let pending_fees: i128 = env.storage()
            .persistent()
            .get(&DataKey::PendingFees(bounty_id))
            .unwrap_or(0);
        
        assert!(pending_fees > 0, "no fees to claim");
        
        let token = token::Client::new(&env, &bounty.asset);
        token.transfer(
            &env.current_contract_address(),
            &platform_admin,
            &pending_fees,
        );
        
        env.storage()
            .persistent()
            .remove(&DataKey::PendingFees(bounty_id));
        
        let mut platform_pending: i128 = env.storage()
            .instance()
            .get(&DataKey::PlatformPendingFees)
            .unwrap_or(0);
        
        platform_pending -= pending_fees;
        env.storage()
            .instance()
            .set(&DataKey::PlatformPendingFees, &platform_pending);
        
        env.events().publish(
            (symbol_short!("CLAIM"), bounty_id),
            (platform_admin, pending_fees),
        );
    }

    // ─────────────────────────────────────────────
    // REVIEW SUBMISSION (Quality Score)
    // ─────────────────────────────────────────────
    
    pub fn review_submission(
        env: Env,
        bounty_id: u64,
        contributor: Address,
        score: u8,
    ) {
        let bounty = Self::get_bounty(&env, bounty_id);
        bounty.poster.require_auth();
        
        assert!(score >= 1 && score <= 10, "score must be 1-10");
        
        let mut submissions: Vec<Submission> =
            env.storage().persistent().get(&DataKey::Submissions(bounty_id)).unwrap();
        
        let index = submissions.iter()
            .position(|s| s.contributor == contributor)
            .expect("submission not found");
        
        let mut submission = submissions.get(index).unwrap();
        submission.review_score = Some(score);
        submissions.set(index, &submission);
        
        env.storage()
            .persistent()
            .set(&DataKey::Submissions(bounty_id), &submissions);
    }

    // ─────────────────────────────────────────────
    // VIEW FUNCTIONS
    // ─────────────────────────────────────────────
    
    pub fn get_bounty(env: Env, bounty_id: u64) -> Bounty {
        env.storage().persistent().get(&DataKey::Bounty(bounty_id)).unwrap()
    }

    pub fn get_submissions(env: Env, bounty_id: u64) -> Vec<Submission> {
        env.storage()
            .persistent()
            .get(&DataKey::Submissions(bounty_id))
            .unwrap_or(Vec::new(&env))
    }

    pub fn bounty_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::BountyCount).unwrap_or(0)
    }

    pub fn get_pending_fees(env: Env, bounty_id: u64) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::PendingFees(bounty_id))
            .unwrap_or(0)
    }

    pub fn get_platform_pending_fees(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::PlatformPendingFees)
            .unwrap_or(0)
    }

    // ─────────────────────────────────────────────
    // INTERNAL HELPERS
    // ─────────────────────────────────────────────
    
    fn get_bounty_assert_open(env: &Env, bounty_id: u64) -> Bounty {
        let bounty: Bounty =
            env.storage().persistent().get(&DataKey::Bounty(bounty_id)).unwrap();

        assert!(
            matches!(
                bounty.status,
                BountyStatus::Open | BountyStatus::UnderReview
            ),
            "bounty not active"
        );

        bounty
    }
    
    fn get_bounty(env: &Env, bounty_id: u64) -> Bounty {
        env.storage().persistent().get(&DataKey::Bounty(bounty_id)).unwrap()
    }
}