import { ethers } from "hardhat";
import { BatchBurner } from "../typechain-types";

async function main() {
  console.log("🚀 Starting BatchBurner deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.003")) {
    console.warn("⚠️  WARNING: Low balance! Deployment may fail.");
  }
  
  // Deploy the contract
  console.log("🔨 Deploying BatchBurner contract...");
  const BatchBurnerFactory = await ethers.getContractFactory("BatchBurner");
  
  // Estimate gas for deployment
  const deploymentTx = await BatchBurnerFactory.getDeployTransaction();
  const gasEstimate = await ethers.provider.estimateGas(deploymentTx);
  console.log("⛽ Estimated gas for deployment:", gasEstimate.toString());
  
  const batchBurner: BatchBurner = await BatchBurnerFactory.deploy();
  await batchBurner.waitForDeployment();
  
  const contractAddress = await batchBurner.getAddress();
  console.log("✅ BatchBurner deployed to:", contractAddress);
  
  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const maxBatchSize = await batchBurner.MAX_BATCH_SIZE();
  const burnAddress = await batchBurner.BURN_ADDRESS();
  const isOperational = await batchBurner.isOperational();
  const version = await batchBurner.getVersion();
  const owner = await batchBurner.owner();
  
  console.log("📊 Contract verification:");
  console.log("  - Max Batch Size:", maxBatchSize.toString());
  console.log("  - Burn Address:", burnAddress);
  console.log("  - Is Operational:", isOperational);
  console.log("  - Version:", version);
  console.log("  - Owner:", owner);
  
  // Security checks
  if (maxBatchSize !== 100n) {
    throw new Error("❌ MAX_BATCH_SIZE is incorrect!");
  }
  if (burnAddress !== "0x000000000000000000000000000000000000dEaD") {
    throw new Error("❌ BURN_ADDRESS is incorrect!");
  }
  if (!isOperational) {
    throw new Error("❌ Contract is not operational!");
  }
  if (owner !== deployer.address) {
    throw new Error("❌ Owner is not the deployer!");
  }
  
  console.log("✅ All security checks passed!");
  
  // Get deployment transaction details
  const deployTx = batchBurner.deploymentTransaction();
  if (deployTx) {
    console.log("📋 Deployment transaction:");
    console.log("  - Hash:", deployTx.hash);
    console.log("  - Gas Used:", deployTx.gasLimit?.toString());
    console.log("  - Gas Price:", deployTx.gasPrice?.toString());
  }
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("📝 Save this information:");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log(`Chain ID: ${(await ethers.provider.getNetwork()).chainId}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Block Number: ${await ethers.provider.getBlockNumber()}`);
  
  return {
    contractAddress,
    deployer: deployer.address,
    network: await ethers.provider.getNetwork()
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then((result) => {
    console.log("\n🚀 Deployment result:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 