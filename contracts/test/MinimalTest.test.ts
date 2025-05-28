import { expect } from "chai";
import hre from "hardhat";

describe("BatchBurner Minimal Test", function () {
  it("Should deploy successfully", async function () {
    const BatchBurnerFactory = await hre.ethers.getContractFactory("BatchBurner");
    const batchBurner = await BatchBurnerFactory.deploy();
    
    // Basic checks
    expect(await batchBurner.MAX_BATCH_SIZE()).to.equal(100);
    expect(await batchBurner.BURN_ADDRESS()).to.equal("0x000000000000000000000000000000000000dEaD");
    expect(await batchBurner.isOperational()).to.be.true;
    expect(await batchBurner.getVersion()).to.equal("2.0.0");
  });
}); 