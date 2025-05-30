import { ethers } from 'hardhat';

async function deployTestToken() {
  console.log("🪙 Deploying Test Token for BaseClean");
  console.log("====================================");

  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.005")) {
    console.log("❌ Insufficient ETH for deployment. Need at least 0.005 ETH");
    return;
  }

  // Deploy multiple test tokens
  const tokens = [
    {
      name: "Test USDC",
      symbol: "TUSDC",
      decimals: 6,
      initialSupply: 1000000 // 1M tokens
    },
    {
      name: "Test DAI",
      symbol: "TDAI", 
      decimals: 18,
      initialSupply: 1000000 // 1M tokens
    },
    {
      name: "Test WETH",
      symbol: "TWETH",
      decimals: 18,
      initialSupply: 10000 // 10k tokens
    }
  ];

  const deployedAddresses: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    console.log(`\n${i + 1}. Deploying ${token.name} (${token.symbol})`);
    
    try {
      const TestToken = await ethers.getContractFactory("TestToken");
      const testToken = await TestToken.deploy(
        token.name,
        token.symbol,
        token.decimals,
        token.initialSupply
      );

      const address = await testToken.getAddress();
      console.log(`   ⏳ Deployment transaction: ${testToken.deploymentTransaction()?.hash}`);
      
      await testToken.waitForDeployment();
      console.log(`   ✅ ${token.symbol} deployed to: ${address}`);
      
      deployedAddresses.push(address);

      // Verify basic functionality
      const name = await testToken.name();
      const symbol = await testToken.symbol();
      const decimals = await testToken.decimals();
      const totalSupply = await testToken.totalSupply();
      
      console.log(`   📋 Name: ${name}`);
      console.log(`   📋 Symbol: ${symbol}`);
      console.log(`   📋 Decimals: ${decimals}`);
      console.log(`   📋 Total Supply: ${ethers.formatUnits(totalSupply, decimals)}`);

    } catch (error: any) {
      console.log(`   ❌ Failed to deploy ${token.symbol}:`, error.message);
    }
  }

  console.log("\n🎉 Test Token Deployment Complete!");
  console.log("\n📋 DEPLOYED ADDRESSES:");
  deployedAddresses.forEach((address, index) => {
    console.log(`   ${tokens[index].symbol}: ${address}`);
  });

  console.log("\n💡 NEXT STEPS:");
  console.log("   1. Copy these addresses to your mintTestTokens.ts script");
  console.log("   2. Run: npm run mint-tokens");
  console.log("   3. Add these tokens to your BaseClean frontend");
  console.log("   4. Test the burning functionality");

  console.log("\n📝 CODE TO ADD TO mintTestTokens.ts:");
  console.log("   const testTokens: string[] = [");
  deployedAddresses.forEach((address, index) => {
    console.log(`     "${address}", // ${tokens[index].symbol}`);
  });
  console.log("   ];");

  return deployedAddresses;
}

deployTestToken()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  }); 