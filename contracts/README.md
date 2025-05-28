# BatchBurner Smart Contract

A secure, gas-optimized smart contract for batch burning ERC-20 tokens, ERC-721 NFTs, and ERC-1155 tokens on Base blockchain.

## 🔒 Security Features

- **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
- **Emergency Pause**: Owner can pause contract in case of vulnerabilities
- **Input Validation**: Comprehensive checks on all parameters
- **No Token Storage**: Contract never holds tokens (immediate burn)
- **Access Controls**: Owner-only emergency functions
- **Gas Optimization**: Efficient batching to prevent DoS attacks
- **Event Logging**: Full transparency of all operations

## 📋 Contract Functions

### Main Functions
- `batchBurnERC20(address[], uint256[])` - Batch burn ERC-20 tokens
- `batchBurnERC721(address[], uint256[])` - Batch burn ERC-721 NFTs
- `batchBurnERC1155(address[], uint256[], uint256[])` - Batch burn ERC-1155 tokens

### View Functions
- `isOperational()` - Check if contract is operational
- `MAX_BATCH_SIZE()` - Get maximum batch size (100)
- `BURN_ADDRESS()` - Get the burn address (0x...dEaD)

### Owner Functions
- `emergencyPause()` - Pause all operations
- `emergencyUnpause()` - Unpause operations
- `emergencyTokenRecovery()` - Recover accidentally sent tokens

## 🚀 Deployment Instructions

### Prerequisites

1. **Install Dependencies**
```bash
cd contracts
npm install
```

2. **Environment Setup**
Create a `.env` file in the contracts directory:
```bash
# Private key for deployment (use a dedicated deployment wallet)
PRIVATE_KEY=your_private_key_here

# BaseScan API key for contract verification
BASESCAN_API_KEY=your_basescan_api_key_here

# Optional: CoinMarketCap API key for gas reporting
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here
```

### Testing

Run comprehensive security tests:
```bash
# Compile contracts
npm run compile

# Run all tests
npm run test

# Generate coverage report
npm run coverage

# Generate gas report
npm run gas-report

# Check contract size
npm run size
```

### Deployment to Testnet

1. **Deploy to Base Goerli**
```bash
npm run deploy:testnet
```

2. **Verify Contract**
```bash
npm run verify:testnet
```

### Deployment to Mainnet

⚠️ **CRITICAL**: Only deploy to mainnet after thorough testing on testnet!

1. **Deploy to Base Mainnet**
```bash
npm run deploy:mainnet
```

2. **Verify Contract**
```bash
npm run verify:mainnet
```

### Post-Deployment Steps

1. **Update Frontend Configuration**
   - Copy the deployed contract address
   - Update `NEXT_PUBLIC_BATCH_BURNER_ADDRESS_MAINNET` in your `.env.local`
   - Verify the contract address in `src/config/web3.ts`

2. **Security Verification**
   - Verify contract on BaseScan
   - Check that owner is correct
   - Confirm contract is operational
   - Test with small amounts first

3. **Optional: Transfer Ownership**
   - Consider transferring ownership to a multisig wallet
   - Use a timelock contract for additional security

## 🔍 Security Audit Checklist

### Pre-Deployment Security Checks

- [ ] All tests pass with 100% coverage
- [ ] Contract size is within limits
- [ ] Gas usage is optimized
- [ ] No compiler warnings
- [ ] ReentrancyGuard is properly applied
- [ ] Access controls are correctly implemented
- [ ] Emergency pause mechanism works
- [ ] Input validation is comprehensive
- [ ] Events are properly emitted

### Post-Deployment Security Checks

- [ ] Contract is verified on BaseScan
- [ ] Owner address is correct
- [ ] Contract is operational
- [ ] Burn address is correct (0x...dEaD)
- [ ] Maximum batch size is 100
- [ ] Emergency functions work (test on testnet)
- [ ] No tokens can be trapped in contract

## 📊 Gas Estimates

| Operation | Gas Estimate (approx) |
|-----------|----------------------|
| Single ERC-20 burn | ~65,000 gas |
| Batch ERC-20 burn (10 tokens) | ~400,000 gas |
| Batch ERC-20 burn (50 tokens) | ~1,800,000 gas |
| ERC-721 burn | ~85,000 gas |
| ERC-1155 burn | ~90,000 gas |
| Contract deployment | ~2,500,000 gas |

## ⚠️ Important Security Considerations

1. **User Approvals Required**: Users must approve the contract for each token before burning
2. **No Upgrade Mechanism**: Contract is immutable to prevent rugpulls
3. **Emergency Pause**: Only use in case of discovered vulnerabilities
4. **Batch Size Limits**: Maximum 100 tokens per batch to prevent gas limit issues
5. **Dead Address**: Tokens are sent to 0x...dEaD (standard burn address)

## 🔗 Contract Verification

After deployment, verify the contract on BaseScan:

**Mainnet**: https://basescan.org/address/{CONTRACT_ADDRESS}
**Testnet**: https://goerli.basescan.org/address/{CONTRACT_ADDRESS}

## 📞 Support

If you encounter any issues or have security concerns:

1. Check the deployment logs for errors
2. Verify all environment variables are set correctly
3. Ensure you're using the correct network
4. Test on testnet before mainnet deployment

## 🏆 Best Practices

1. **Always test on testnet first**
2. **Use a dedicated deployment wallet with minimal funds**
3. **Verify contracts immediately after deployment**
4. **Monitor contract activity after deployment**
5. **Consider professional security audits for production use**

---

**⚠️ DISCLAIMER**: This contract handles user tokens. Always conduct thorough testing and consider professional security audits before production use. 