#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Vec, 
    symbol_short, token
};

#[contracttype]
#[derive(Clone)]
pub struct PortfolioNFT {
    pub token_id: u64,
    pub owner: Address,
    pub bounty_id: u64,
    pub metadata_uri: String,
    pub minted_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    NFT(u64),
    OwnerNFTs(Address),
    TotalSupply,
    BountyContract,
    MetadataBase,
}

#[contract]
pub struct PortfolioNFTContract;

#[contractimpl]
impl PortfolioNFTContract {
    // ─────────────────────────────────────────────
    // INITIALIZATION
    // ─────────────────────────────────────────────
    
    pub fn initialize(env: Env, bounty_contract: Address, metadata_base: String) {
        if env.storage().instance().has(&DataKey::BountyContract) {
            panic!("already initialized");
        }
        
        env.storage().instance().set(&DataKey::BountyContract, &bounty_contract);
        env.storage().instance().set(&DataKey::MetadataBase, &metadata_base);
        env.storage().instance().set(&DataKey::TotalSupply, &0u64);
    }
    
    // ─────────────────────────────────────────────
    // MINT NFT (Only Bounty Contract)
    // ─────────────────────────────────────────────
    
    pub fn mint_portfolio_nft(
        env: Env,
        contributor: Address,
        bounty_id: u64,
        metadata_uri: String,
    ) -> u64 {
        let bounty_contract: Address = env.storage().instance().get(&DataKey::BountyContract).unwrap();
        let caller = env.invoker();
        assert!(caller == bounty_contract, "only bounty contract");
        
        let total_supply: u64 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        let token_id = total_supply + 1;
        
        let nft = PortfolioNFT {
            token_id,
            owner: contributor.clone(),
            bounty_id,
            metadata_uri,
            minted_at: env.ledger().timestamp(),
        };
        
        // Store NFT
        env.storage().persistent().set(&DataKey::NFT(token_id), &nft);
        
        // Add to owner's collection
        let mut owner_nfts: Vec<u64> = env.storage()
            .persistent()
            .get(&DataKey::OwnerNFTs(contributor.clone()))
            .unwrap_or(Vec::new(&env));
        
        owner_nfts.push_back(token_id);
        env.storage()
            .persistent()
            .set(&DataKey::OwnerNFTs(contributor), &owner_nfts);
        
        // Update total supply
        env.storage().instance().set(&DataKey::TotalSupply, &token_id);
        
        env.events().publish(
            (symbol_short!("MINT"), token_id),
            (contributor, bounty_id),
        );
        
        token_id
    }
    
    // ─────────────────────────────────────────────
    // VIEW FUNCTIONS
    // ─────────────────────────────────────────────
    
    pub fn get_nft(env: Env, token_id: u64) -> PortfolioNFT {
        env.storage()
            .persistent()
            .get(&DataKey::NFT(token_id))
            .unwrap_or_else(|| panic!("NFT not found"))
    }
    
    pub fn get_owner_nfts(env: Env, owner: Address) -> Vec<PortfolioNFT> {
        let token_ids: Vec<u64> = env.storage()
            .persistent()
            .get(&DataKey::OwnerNFTs(owner))
            .unwrap_or(Vec::new(&env));
        
        let mut nfts = Vec::new(&env);
        for token_id in token_ids.iter() {
            if let Some(nft) = env.storage().persistent().get(&DataKey::NFT(*token_id)) {
                nfts.push_back(nft);
            }
        }
        
        nfts
    }
    
    pub fn total_supply(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0)
    }
    
    pub fn get_metadata_base(env: Env) -> String {
        env.storage().instance().get(&DataKey::MetadataBase).unwrap()
    }
}