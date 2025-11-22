/**
 * Contract addresses for different networks
 * Based on official documentation:
 * - Pyth Entropy: https://docs.pyth.network/entropy/contract-addresses
 * - Aave V3: To be verified from Aave docs
 */

export const ADDRESSES = {
  baseSepolia: {
    // Pyth Entropy on Base Sepolia
    // Check: https://docs.pyth.network/entropy/contract-addresses
    pythEntropy: "0x0000000000000000000000000000000000000000", // TODO: Update with actual address
    
    // Aave V3 Pool on Base Sepolia
    aavePool: "0x0000000000000000000000000000000000000000", // TODO: Update with actual address
    
    // USDC on Base Sepolia (6 decimals)
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
    
    // Estimated Pyth fee (in wei)
    pythFee: "100000000000000", // 0.0001 ETH - adjust based on actual fees
  },
  base: {
    // Pyth Entropy on Base Mainnet
    pythEntropy: "0x0000000000000000000000000000000000000000", // TODO: Update with actual address
    
    // Aave V3 Pool on Base Mainnet
    aavePool: "0x0000000000000000000000000000000000000000", // TODO: Update with actual address
    
    // USDC on Base Mainnet (6 decimals)
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base Mainnet USDC
    
    // Estimated Pyth fee (in wei)
    pythFee: "100000000000000", // 0.0001 ETH - adjust based on actual fees
  },
};

// Ticket price in USDC (6 decimals)
// $1 USD = 1,000,000 (6 decimals)
export const TICKET_PRICE = "1000000"; // 1 USDC

