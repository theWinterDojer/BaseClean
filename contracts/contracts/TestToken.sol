// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestToken
 * @dev Simple ERC20 token for testing BaseClean functionality
 * @notice This is for TESTNET ONLY - do not use on mainnet
 */
contract TestToken is ERC20, Ownable {
    uint8 private _decimals;
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**18; // 1000 tokens
    uint256 public constant MAX_FAUCET_PER_ADDRESS = 10000 * 10**18; // 10k tokens max per address
    
    mapping(address => uint256) public faucetClaimed;
    
    event FaucetUsed(address indexed user, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        _mint(msg.sender, initialSupply * 10**decimals_);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Public faucet function - anyone can claim test tokens
     * @param amount Amount of tokens to mint (with decimals)
     */
    function faucet(uint256 amount) external {
        require(amount <= FAUCET_AMOUNT, "TestToken: Amount exceeds faucet limit");
        require(
            faucetClaimed[msg.sender] + amount <= MAX_FAUCET_PER_ADDRESS,
            "TestToken: Exceeds max faucet per address"
        );
        
        faucetClaimed[msg.sender] += amount;
        _mint(msg.sender, amount);
        
        emit FaucetUsed(msg.sender, amount);
    }
    
    /**
     * @dev Simple public mint function for testing
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        require(amount <= FAUCET_AMOUNT, "TestToken: Amount exceeds mint limit");
        _mint(to, amount);
    }
    
    /**
     * @dev Owner can mint any amount (for setup purposes)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function ownerMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Check how much more can be claimed from faucet
     * @param user Address to check
     * @return remaining Amount that can still be claimed
     */
    function faucetRemaining(address user) external view returns (uint256) {
        uint256 claimed = faucetClaimed[user];
        if (claimed >= MAX_FAUCET_PER_ADDRESS) {
            return 0;
        }
        return MAX_FAUCET_PER_ADDRESS - claimed;
    }
} 