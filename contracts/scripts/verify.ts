import { run } from "hardhat";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.error("❌ Please set CONTRACT_ADDRESS environment variable");
    console.log("Usage: CONTRACT_ADDRESS=0x... npm run verify:mainnet");
    process.exit(1);
  }
  
  console.log("🔍 Verifying contract at:", contractAddress);
  
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // BatchBurner has no constructor arguments
    });
    
    console.log("✅ Contract verified successfully!");
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification script failed:", error);
    process.exit(1);
  }); 