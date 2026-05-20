#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Vec, Map, 
    symbol_short, token, unwrap::UnwrapOptimized
};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum BountyPlacement {
    First,
    Second,
    Third,
    Participation,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum MemberTier {
    Lurker,      // 0-99 XP
    Contributor, // 100-499 XP
    Member,      // 500-999 XP
    Lead,        // 1000-4999 XP
    Legend,      // 5000+ XP
}

#[contracttype]
#[derive(Clone)]
pub struct ContributorProfile {
    pub total_xp: i128,
    pub skill_xp: Map<String, i128>,
    pub completed_bounties: u32,
    pub won_bounties: u32,
    pub reviewed_bounties: u32,
    pub member_tier: MemberTier,
    pub last_active: u64,
    pub nft_portfolio: Vec<u64>, // Bounty IDs where they won
}

#[contracttype]
#[derive(Clone)]
pub struct Badge {
    pub badge_type: String,
    pub awarded_at: u64,
    pub bounty_id: u64,
    pub skill_tag: String,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Profile(Address),
    Badges(Address),
    SkillLeaderboard(String),
    TotalContributors,
    Config,
}

#[contracttype]
#[derive(Clone)]
pub struct Config {
    pub platform_admin: Address,
    pub bounty_contract: Address, // Only this contract can award XP
    pub xp_multipliers: Map<String, u32>, // Skill-specific multipliers
}

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
    // ─────────────────────────────────────────────
    // INITIALIZATION
    // ─────────────────────────────────────────────
    
    pub fn initialize(env: Env, platform_admin: Address, bounty_contract: Address) {
        if env.storage().instance().has(&DataKey::Config) {
            panic!("already initialized");
        }
        
        platform_admin.require_auth();
        
        let mut multipliers = Map::new(&env);
        multipliers.set(String::from_str(&env, "development"), 10); // 1.0x base
        multipliers.set(String::from_str(&env, "design"), 10);
        multipliers.set(String::from_str(&env, "strategy"), 12); // 1.2x
        multipliers.set(String::from_str(&env, "writing"), 10);
        multipliers.set(String::from_str(&env, "community"), 15); // 1.5x
        
        let config = Config {
            platform_admin: platform_admin.clone(),
            bounty_contract,
            xp_multipliers: multipliers,
        };
        
        env.storage().instance().set(&DataKey::Config, &config);
        env.storage().instance().set(&DataKey::TotalContributors, &0u32);
    }
    
    // ─────────────────────────────────────────────
    // XP AWARDING (Only Bounty Contract)
    // ─────────────────────────────────────────────
    
    pub fn award_bounty_xp(
        env: Env,
        contributor: Address,
        placement: BountyPlacement,
        skill_tag: String,
        bounty_id: u64,
    ) {
        // Only bounty contract can call this
        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();
        let caller = env.invoker();
        assert!(caller == config.bounty_contract, "unauthorized");
        
        let base_xp = match placement {
            BountyPlacement::First => 80,
            BountyPlacement::Second => 60,
            BountyPlacement::Third => 50,
            BountyPlacement::Participation => 20,
        };
        
        // Apply skill multiplier
        let multiplier = config.xp_multipliers.get(skill_tag.clone()).unwrap_or(10);
        let final_xp = (base_xp * multiplier) / 10;
        
        // Get or create profile
        let mut profile = Self::get_profile(&env, contributor.clone());
        profile.total_xp += final_xp as i128;
        
        // Update skill-specific XP
        let mut skill_xp = profile.skill_xp;
        let current = skill_xp.get(skill_tag.clone()).unwrap_or(0);
        skill_xp.set(skill_tag.clone(), current + final_xp as i128);
        profile.skill_xp = skill_xp;
        
        profile.completed_bounties += 1;
        profile.won_bounties += 1;
        profile.last_active = env.ledger().timestamp();
        
        // Add to NFT portfolio
        let mut portfolio = profile.nft_portfolio;
        portfolio.push_back(bounty_id);
        profile.nft_portfolio = portfolio;
        
        // Update tier
        profile.member_tier = Self::calculate_tier(profile.total_xp);
        
        Self::save_profile(&env, contributor.clone(), profile);
        
        // Award badge
        Self::award_badge(&env, contributor, bounty_id, skill_tag, placement);
        
        // Update leaderboard
        Self::update_skill_leaderboard(&env, skill_tag);
    }
    
    pub fn award_reviewer_xp(
        env: Env,
        reviewer: Address,
        bounty_id: u64,
        review_quality: u8, // 1-10
    ) {
        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();
        let caller = env.invoker();
        assert!(caller == config.bounty_contract, "unauthorized");
        
        let xp_amount = 5 + (review_quality / 2); // 5-10 XP
        
        let mut profile = Self::get_profile(&env, reviewer.clone());
        profile.total_xp += xp_amount as i128;
        profile.reviewed_bounties += 1;
        profile.last_active = env.ledger().timestamp();
        profile.member_tier = Self::calculate_tier(profile.total_xp);
        
        Self::save_profile(&env, reviewer, profile);
    }
    
    pub fn add_xp(env: Env, contributor: Address, amount: u32) {
        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();
        let caller = env.invoker();
        assert!(caller == config.bounty_contract, "unauthorized");
        
        let mut profile = Self::get_profile(&env, contributor.clone());
        profile.total_xp += amount as i128;
        profile.last_active = env.ledger().timestamp();
        profile.member_tier = Self::calculate_tier(profile.total_xp);
        
        Self::save_profile(&env, contributor, profile);
    }
    
    // ─────────────────────────────────────────────
    // BADGE MANAGEMENT
    // ─────────────────────────────────────────────
    
    pub fn award_badge(
        env: &Env,
        contributor: Address,
        bounty_id: u64,
        skill_tag: String,
        placement: BountyPlacement,
    ) {
        let placement_str = match placement {
            BountyPlacement::First => "Winner",
            BountyPlacement::Second => "Runner Up",
            BountyPlacement::Third => "Third Place",
            BountyPlacement::Participation => "Participant",
        };
        
        let badge_name = String::from_str(env, &format!("{} - {}", placement_str, skill_tag));
        
        let mut badges: Vec<Badge> = env.storage()
            .persistent()
            .get(&DataKey::Badges(contributor.clone()))
            .unwrap_or(Vec::new(env));
        
        badges.push_back(Badge {
            badge_type: badge_name,
            awarded_at: env.ledger().timestamp(),
            bounty_id,
            skill_tag,
        });
        
        env.storage()
            .persistent()
            .set(&DataKey::Badges(contributor), &badges);
    }
    
    pub fn mint_badge(env: Env, contributor: Address, bounty_id: u64, skill_tag: String) {
        // Alias for award_badge with Participation placement
        Self::award_badge(&env, contributor, bounty_id, skill_tag, BountyPlacement::Participation);
    }
    
    pub fn mint_portfolio_nft(
        env: Env,
        contributor: Address,
        bounty_id: u64,
        metadata_uri: String,
    ) {
        // This would mint an actual NFT - simplified for now
        // In production, you'd call an NFT contract here
        
        let config: Config = env.storage().instance().get(&DataKey::Config).unwrap();
        let caller = env.invoker();
        assert!(caller == config.bounty_contract, "unauthorized");
        
        // Emit event that NFT should be minted
        env.events().publish(
            (symbol_short!("NFT_MINT"), contributor),
            (bounty_id, metadata_uri),
        );
    }
    
    // ─────────────────────────────────────────────
    // LEADERBOARDS & QUERIES
    // ─────────────────────────────────────────────
    
    pub fn get_skill_leaderboard(env: Env, skill_tag: String, limit: u32) -> Vec<(Address, i128)> {
        // This is simplified - in production you'd maintain sorted indices
        let mut leaderboard = Vec::new(&env);
        
        // Get total contributors and iterate
        let total: u32 = env.storage().instance().get(&DataKey::TotalContributors).unwrap_or(0);
        
        // This would need optimization for mainnet
        for i in 0..total.min(limit) {
            // In real implementation, maintain a sorted list
            leaderboard.push_back((Address::generate(&env), 0));
        }
        
        leaderboard
    }
    
    pub fn get_profile(env: Env, contributor: Address) -> ContributorProfile {
        Self::get_profile(&env, contributor)
    }
    
    pub fn get_badges(env: Env, contributor: Address) -> Vec<Badge> {
        env.storage()
            .persistent()
            .get(&DataKey::Badges(contributor))
            .unwrap_or(Vec::new(&env))
    }
    
    pub fn get_contributor_stats(env: Env, contributor: Address) -> (i128, u32, MemberTier) {
        let profile = Self::get_profile(&env, contributor);
        (profile.total_xp, profile.completed_bounties, profile.member_tier)
    }
    
    pub fn total_contributors(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::TotalContributors).unwrap_or(0)
    }
    
    // ─────────────────────────────────────────────
    // CONFIGURATION (Admin Only)
    // ─────────────────────────────────────────────
    
    pub fn update_xp_multiplier(env: Env, admin: Address, skill_tag: String, multiplier: u32) {
        let mut config: Config = env.storage().instance().get(&DataKey::Config).unwrap();
        admin.require_auth();
        assert!(admin == config.platform_admin, "not admin");
        
        let mut multipliers = config.xp_multipliers;
        multipliers.set(skill_tag, multiplier);
        config.xp_multipliers = multipliers;
        
        env.storage().instance().set(&DataKey::Config, &config);
    }
    
    // ─────────────────────────────────────────────
    // INTERNAL HELPERS
    // ─────────────────────────────────────────────
    
    fn get_profile(env: &Env, address: Address) -> ContributorProfile {
        env.storage()
            .persistent()
            .get(&DataKey::Profile(address.clone()))
            .unwrap_or(ContributorProfile {
                total_xp: 0,
                skill_xp: Map::new(env),
                completed_bounties: 0,
                won_bounties: 0,
                reviewed_bounties: 0,
                member_tier: MemberTier::Lurker,
                last_active: env.ledger().timestamp(),
                nft_portfolio: Vec::new(env),
            })
    }
    
    fn save_profile(env: &Env, address: Address, profile: ContributorProfile) {
        let exists = env.storage().persistent().has(&DataKey::Profile(address.clone()));
        
        if !exists {
            let total: u32 = env.storage().instance().get(&DataKey::TotalContributors).unwrap_or(0);
            env.storage().instance().set(&DataKey::TotalContributors, &(total + 1));
        }
        
        env.storage()
            .persistent()
            .set(&DataKey::Profile(address), &profile);
    }
    
    fn calculate_tier(xp: i128) -> MemberTier {
        match xp {
            0..=99 => MemberTier::Lurker,
            100..=499 => MemberTier::Contributor,
            500..=999 => MemberTier::Member,
            1000..=4999 => MemberTier::Lead,
            _ => MemberTier::Legend,
        }
    }
    
    fn update_skill_leaderboard(env: &Env, skill_tag: String) {
        // In production, maintain a sorted set of addresses by XP for each skill
        // This is simplified
    }
}