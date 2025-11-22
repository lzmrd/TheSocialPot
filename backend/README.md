# MegaYield Backend

Blockchain backend implementation for MegaYield - A lottery system similar to Megapot but with 10-year monthly vesting payout via Aave lending.

## Overview

MegaYield is a decentralized lottery system that:
- Allows users to buy tickets (1 USDC each)
- Selects a daily winner using Pyth Entropy for provable randomness
- Pays the first month's payment immediately to the winner
- Deposits the remaining jackpot (119 months worth) on Aave for lending
- Releases monthly payments to the winner over 10 years (120 months total)

## Architecture

### Smart Contracts

1. **MegaYieldLottery.sol** - Main lottery contract
   - Manages ticket purchases
   - Accumulates jackpot (70% of ticket sales)
   - Handles referrals (30% of ticket sales)
   - Selects daily winners using Pyth Entropy
   - Pays first month immediately and transfers rest to vesting

2. **MegaYieldVesting.sol** - Vesting contract
   - Manages 10-year monthly payout schedule
   - Deposits funds to Aave lending pool
   - Allows winner to claim monthly payments
   - Handles withdrawals from Aave for monthly payouts

3. **AaveIntegration.sol** - Aave wrapper contract
   - Handles USDC deposits to Aave Pool
   - Manages withdrawals from Aave Pool
   - Provides balance queries including accrued interest

4. **PythIntegration.sol** - Pyth Entropy wrapper
   - Manages random number requests to Pyth Entropy
   - Handles random number revelation
   - Provides status checks for randomness availability

## Setup

### Prerequisites

- Node.js 18+ and npm
- Hardhat
- An account with ETH for deployment (Base Sepolia for testnet, Base for mainnet)

### Installation

```bash
npm install
```

### Configuration

1. Create a `.env` file in the backend directory:

```env
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

2. Update contract addresses in `config/addresses.ts`:

You need to add the following addresses from official documentation:
- **Pyth Entropy**: Get from [Pyth Entropy Contract Addresses](https://docs.pyth.network/entropy/contract-addresses)
- **Aave Pool**: Get from Aave documentation for Base network
- **USDC**: Already configured for Base Sepolia and Base mainnet

Example:
```typescript
baseSepolia: {
  pythEntropy: "0x...", // From Pyth docs
  aavePool: "0x...", // From Aave docs
  usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  pythFee: "100000000000000", // 0.0001 ETH
}
```

## Compilation

```bash
npm run compile
```

## Testing

```bash
npm test
```

Note: Full integration tests require actual contract addresses on testnet. Mock contracts are used for unit tests.

## Deployment

### Deploy to Base Sepolia (Testnet)

1. Ensure addresses are configured in `config/addresses.ts`
2. Ensure your `.env` file has `PRIVATE_KEY` and `BASE_SEPOLIA_RPC_URL` set
3. Fund your account with ETH on Base Sepolia
4. Run deployment:

```bash
npm run deploy:testnet
```

### Deploy to Base Mainnet

1. Ensure addresses are configured in `config/addresses.ts`
2. Ensure your `.env` file has `PRIVATE_KEY` and `BASE_MAINNET_RPC_URL` set
3. Fund your account with ETH on Base
4. Run deployment:

```bash
npm run deploy:mainnet
```

## Contract Verification

After deployment, verify contracts on Basescan:

```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

The deployment script will output the exact verification commands to use.

## Key Features

### Ticket System
- Ticket price: 1 USDC (configurable)
- 70% of ticket price goes to jackpot
- 30% goes to referrer (or back to jackpot if no referrer)
- Daily drawings (resets at midnight UTC)

### Winner Selection
- Uses Pyth Entropy for provably fair randomness
- Daily winner selection
- If no winner selected, jackpot carries over to next day

### Payout System
- **First Payment**: 1/120th of jackpot paid immediately
- **Remaining Payments**: 119/120th deposited on Aave
- Monthly payments for 10 years (120 months total)
- Winner can claim monthly payment after 30 days from last payment
- Interest earned on Aave goes to winner

### Security
- Uses OpenZeppelin contracts (audited)
- ReentrancyGuard protection
- Access control with Ownable pattern
- SafeERC20 for token transfers

## Documentation References

- [Megapot Documentation](https://docs.megapot.io/)
- [Pyth Entropy Documentation](https://docs.pyth.network/entropy/)
- [Aave V3 Documentation](https://docs.aave.com/developers/)
- [Base Network Documentation](https://docs.base.org/)

## Development

### Project Structure

```
backend/
├── contracts/
│   ├── MegaYieldLottery.sol
│   ├── MegaYieldVesting.sol
│   ├── AaveIntegration.sol
│   ├── PythIntegration.sol
│   └── mocks/
│       └── MockERC20.sol
├── interfaces/
│   ├── IAavePool.sol
│   ├── IPyth.sol
│   └── IERC20.sol
├── scripts/
│   └── deploy.ts
├── test/
│   └── MegaYieldLottery.test.ts
├── config/
│   └── addresses.ts
├── hardhat.config.ts
└── package.json
```

## Notes

- The Pyth Entropy integration may need adjustment based on the actual Pyth Entropy API. Check the [official Pyth Entropy documentation](https://docs.pyth.network/entropy/) for the correct implementation pattern.
- Aave V3 Pool addresses need to be verified from Aave documentation for Base network.
- Pyth fees should be adjusted based on actual network fees.

## License

MIT


