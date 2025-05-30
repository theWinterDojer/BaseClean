import { ethers } from 'hardhat';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const TEST_TOKEN_ABI = [
  "function faucet(uint256 amount) external",
  "function mint(address to, uint256 amount) external", 
  "function balanceOf(address) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

async function mintTestTokens() {
  console.log("🪙 BaseClean Test Token Minter");
  console.log("==============================");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Connected to: ${network.name} (Chain ID: ${network.chainId})`);

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log(`👤 Using wallet: ${signer.address}`);

  // Check wallet balance
  const balance = await ethers.provider.getBalance(signer.address);
  console.log(`💰 ETH Balance: ${ethers.formatEther(balance)} ETH`);

  if (balance < ethers.parseEther("0.005")) {
    console.log("❌ Warning: Low ETH balance. You may need more ETH for gas fees.");
    console.log("   Get testnet ETH from: https://faucet.quicknode.com/base/sepolia");
    console.log("   Or: https://tokentool.bitbond.com/faucet/base-sepolia");
    console.log("   Continuing anyway since token minting uses minimal gas...");
  }

  // Base Sepolia test token addresses
  // Add your own deployed test tokens here or use existing ones
  const testTokens: string[] = [
    // Freshly deployed test tokens with public mint functions:
    "0x80Ee7D73e7121944a306A2fed47e23B7B56C1A63", // TUSDC
    "0xdF89b78C439ba0A3a8CC27c201EFacA321391319", // TDAI
    "0x1b4c6b3da6F643843a7E2A7E41ddE4b4AFEd4a04", // TWETH
    
    // Add more test token addresses here:
    // "0x1234567890123456789012345678901234567890", // Your deployed test token
    
    // Popular Base Sepolia test tokens (uncomment to try):
    // Note: These may or may not have public mint functions
    // "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC Base Sepolia (example)
    // "0x4200000000000000000000000000000000000006", // WETH Base Sepolia (example)
  ];

  if (testTokens.length === 0) {
    console.log("📝 No test token addresses configured.");
    console.log("");
    console.log("💡 TO ADD TEST TOKENS:");
    console.log("   1. Deploy your own test tokens (see contracts/contracts/TestToken.sol)");
    console.log("   2. Or find existing Base Sepolia test tokens");
    console.log("   3. Add their addresses to the testTokens array in this script");
    console.log("");
    console.log("🚀 TO DEPLOY A TEST TOKEN:");
    console.log("   npm run deploy:test-token");
    console.log("");
    console.log("🔍 FIND EXISTING TOKENS:");
    console.log("   • Check Base Sepolia block explorer: https://sepolia.basescan.org/");
    console.log("   • Look for ERC20 tokens with public mint/faucet functions");
    return;
  }

  console.log(`\n🎯 Attempting to mint from ${testTokens.length} token(s):`);

  for (let i = 0; i < testTokens.length; i++) {
    const tokenAddress = testTokens[i];
    console.log(`\n${i + 1}. Processing token: ${tokenAddress}`);

    try {
      const token = new ethers.Contract(tokenAddress, TEST_TOKEN_ABI, signer);
      
      // Get token info
      let tokenName = "Unknown";
      let tokenSymbol = "???";
      let decimals = 18;
      
      try {
        tokenName = await token.name();
        tokenSymbol = await token.symbol();
        decimals = await token.decimals();
        console.log(`   📋 Token: ${tokenName} (${tokenSymbol}), Decimals: ${decimals}`);
      } catch {
        console.log("   📋 Token info not available");
      }

      // Check current balance
      try {
        const currentBalance = await token.balanceOf(signer.address);
        console.log(`   💰 Current balance: ${ethers.formatUnits(currentBalance, decimals)} ${tokenSymbol}`);
      } catch {
        console.log("   💰 Could not check current balance");
      }

      const mintAmount = ethers.parseUnits("1000", decimals);
      
      // Try faucet function first
      try {
        console.log(`   🚰 Trying faucet function...`);
        const tx = await token.faucet(mintAmount);
        console.log(`   ⏳ Transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log(`   ✅ Successfully minted 1000 ${tokenSymbol} via faucet!`);
        continue;
      } catch (faucetError: any) {
        console.log(`   ❌ Faucet failed: ${faucetError.message?.split('.')[0] || 'Unknown error'}`);
      }

      // Try mint function as fallback
      try {
        console.log(`   🏭 Trying mint function...`);
        const tx = await token.mint(signer.address, mintAmount);
        console.log(`   ⏳ Transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log(`   ✅ Successfully minted 1000 ${tokenSymbol} via mint!`);
      } catch (mintError: any) {
        console.log(`   ❌ Mint failed: ${mintError.message?.split('.')[0] || 'Unknown error'}`);
        console.log(`   ⚠️  This token might not support public minting`);
      }

    } catch (error: any) {
      console.log(`   💥 Contract error: ${error.message?.split('.')[0] || 'Unknown error'}`);
    }
  }

  console.log("\n🎉 Minting process complete!");
  console.log("\n💡 NEXT STEPS:");
  console.log("   • Deploy your own test tokens for guaranteed minting");
  console.log("   • Add successful token addresses to your frontend");
  console.log("   • Test your BaseClean burning functionality");
  console.log("   • Check your wallet for the new tokens");
}

// Main execution
mintTestTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  }); 