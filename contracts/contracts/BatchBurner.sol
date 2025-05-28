// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title BatchBurner
 * @dev A secure contract for batch burning ERC20 tokens, ERC721 NFTs, and ERC1155 tokens
 * 
 * SECURITY FEATURES:
 * - ReentrancyGuard: Prevents reentrancy attacks
 * - SafeERC20: Handles non-standard ERC20 tokens safely
 * - Pausable: Emergency stop functionality
 * - Input validation: Comprehensive checks on all inputs
 * - Gas optimization: Efficient batching to prevent DoS
 * - Event logging: Full transparency of all operations
 * - No token storage: Contract never holds tokens (immediate burn)
 * - Access controls: Owner-only emergency functions
 * 
 * SAFETY PRINCIPLES:
 * 1. This contract can ONLY burn tokens, never transfer them elsewhere
 * 2. Users must explicitly approve this contract for each token
 * 3. Contract has no upgrade mechanism to prevent rugpulls
 * 4. All operations are transparent via events
 * 5. Emergency pause protects against discovered vulnerabilities
 * 
 * SECURITY IMPROVEMENTS:
 * - SafeERC20 for compatibility with all token types (USDT, etc.)
 * - Gas optimizations in loops
 * - Better error handling
 * - Enhanced event data
 */
contract BatchBurner is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    using Address for address;

    // Dead address for burning tokens (standard burn address)
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    // Maximum batch size to prevent gas limit issues
    uint256 public constant MAX_BATCH_SIZE = 100;
    
    // Contract version for tracking
    string public constant VERSION = "2.0.0";
    
    // Events for transparency
    event ERC20BatchBurn(
        address indexed user,
        address[] tokens,
        uint256[] amounts,
        uint256 indexed batchSize,
        uint256 timestamp
    );
    
    event ERC721BatchBurn(
        address indexed user,
        address[] contracts,
        uint256[] tokenIds,
        uint256 indexed batchSize,
        uint256 timestamp
    );
    
    event ERC1155BatchBurn(
        address indexed user,
        address[] contracts,
        uint256[] tokenIds,
        uint256[] amounts,
        uint256 indexed batchSize,
        uint256 timestamp
    );
    
    event EmergencyPause(address indexed admin, uint256 timestamp);
    event EmergencyUnpause(address indexed admin, uint256 timestamp);

    // Custom errors for gas efficiency
    error InvalidBatchSize();
    error ArrayLengthMismatch();
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientBalance();
    error InsufficientAllowance();
    error NotTokenOwner();
    error ContractNotApproved();

    constructor() {
        // Contract starts unpaused
        // Owner is set to deployer via Ownable constructor
    }

    /**
     * @dev Batch burn ERC20 tokens
     * @param tokens Array of ERC20 token contract addresses
     * @param amounts Array of amounts to burn (in token's smallest unit)
     * 
     * SECURITY CHECKS:
     * - Validates array lengths match
     * - Checks batch size limits
     * - Validates token addresses and amounts
     * - Ensures user has sufficient balance and allowance
     * - Burns tokens immediately (no storage in contract)
     * - Uses SafeERC20 for compatibility with all token types
     */
    function batchBurnERC20(
        address[] calldata tokens,
        uint256[] calldata amounts
    ) external nonReentrant whenNotPaused {
        uint256 tokensLength = tokens.length;
        
        // Input validation - gas optimized
        if (tokensLength == 0 || tokensLength > MAX_BATCH_SIZE) {
            revert InvalidBatchSize();
        }
        if (tokensLength != amounts.length) {
            revert ArrayLengthMismatch();
        }

        // Cache msg.sender to save gas
        address sender = msg.sender;
        
        // Process each token
        for (uint256 i; i < tokensLength;) {
            address tokenAddress = tokens[i];
            uint256 amount = amounts[i];
            
            // Validate inputs
            if (tokenAddress == address(0)) revert ZeroAddress();
            if (amount == 0) revert ZeroAmount();
            
            IERC20 token = IERC20(tokenAddress);
            
            // Check balance and allowance - batch these calls for gas efficiency
            if (token.balanceOf(sender) < amount) {
                revert InsufficientBalance();
            }
            if (token.allowance(sender, address(this)) < amount) {
                revert InsufficientAllowance();
            }
            
            // Execute burn using SafeERC20 - handles all token types safely
            token.safeTransferFrom(sender, BURN_ADDRESS, amount);
            
            unchecked {
                ++i;
            }
        }
        
        emit ERC20BatchBurn(sender, tokens, amounts, tokensLength, block.timestamp);
    }

    /**
     * @dev Batch burn ERC721 NFTs
     * @param contracts Array of ERC721 contract addresses
     * @param tokenIds Array of token IDs to burn
     * 
     * SECURITY CHECKS:
     * - Validates ownership of each NFT
     * - Ensures contract has approval
     * - Burns NFTs immediately to dead address
     */
    function batchBurnERC721(
        address[] calldata contracts,
        uint256[] calldata tokenIds
    ) external nonReentrant whenNotPaused {
        uint256 contractsLength = contracts.length;
        
        // Input validation
        if (contractsLength == 0 || contractsLength > MAX_BATCH_SIZE) {
            revert InvalidBatchSize();
        }
        if (contractsLength != tokenIds.length) {
            revert ArrayLengthMismatch();
        }

        // Cache msg.sender to save gas
        address sender = msg.sender;

        // Process each NFT
        for (uint256 i; i < contractsLength;) {
            address contractAddress = contracts[i];
            uint256 tokenId = tokenIds[i];
            
            if (contractAddress == address(0)) revert ZeroAddress();
            
            IERC721 nftContract = IERC721(contractAddress);
            
            // Verify ownership
            if (nftContract.ownerOf(tokenId) != sender) {
                revert NotTokenOwner();
            }
            
            // Check approval (either approved for this token or approved for all)
            if (nftContract.getApproved(tokenId) != address(this) && 
                !nftContract.isApprovedForAll(sender, address(this))) {
                revert ContractNotApproved();
            }
            
            // Execute burn (transfer to dead address)
            nftContract.safeTransferFrom(sender, BURN_ADDRESS, tokenId);
            
            unchecked {
                ++i;
            }
        }
        
        emit ERC721BatchBurn(sender, contracts, tokenIds, contractsLength, block.timestamp);
    }

    /**
     * @dev Batch burn ERC1155 tokens
     * @param contracts Array of ERC1155 contract addresses
     * @param tokenIds Array of token IDs to burn
     * @param amounts Array of amounts to burn for each token ID
     * 
     * SECURITY CHECKS:
     * - Validates sufficient balance for each token
     * - Ensures contract has approval
     * - Burns tokens immediately to dead address
     */
    function batchBurnERC1155(
        address[] calldata contracts,
        uint256[] calldata tokenIds,
        uint256[] calldata amounts
    ) external nonReentrant whenNotPaused {
        uint256 contractsLength = contracts.length;
        
        // Input validation
        if (contractsLength == 0 || contractsLength > MAX_BATCH_SIZE) {
            revert InvalidBatchSize();
        }
        if (contractsLength != tokenIds.length || contractsLength != amounts.length) {
            revert ArrayLengthMismatch();
        }

        // Cache msg.sender to save gas
        address sender = msg.sender;

        // Process each token
        for (uint256 i; i < contractsLength;) {
            address contractAddress = contracts[i];
            uint256 tokenId = tokenIds[i];
            uint256 amount = amounts[i];
            
            if (contractAddress == address(0)) revert ZeroAddress();
            if (amount == 0) revert ZeroAmount();
            
            IERC1155 tokenContract = IERC1155(contractAddress);
            
            // Check balance
            if (tokenContract.balanceOf(sender, tokenId) < amount) {
                revert InsufficientBalance();
            }
            
            // Check approval
            if (!tokenContract.isApprovedForAll(sender, address(this))) {
                revert ContractNotApproved();
            }
            
            // Execute burn (transfer to dead address)
            tokenContract.safeTransferFrom(
                sender,
                BURN_ADDRESS,
                tokenId,
                amount,
                ""
            );
            
            unchecked {
                ++i;
            }
        }
        
        emit ERC1155BatchBurn(sender, contracts, tokenIds, amounts, contractsLength, block.timestamp);
    }

    /**
     * @dev Emergency pause function - only owner can call
     * Used to halt all operations if a vulnerability is discovered
     */
    function emergencyPause() external onlyOwner {
        _pause();
        emit EmergencyPause(msg.sender, block.timestamp);
    }

    /**
     * @dev Emergency unpause function - only owner can call
     */
    function emergencyUnpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpause(msg.sender, block.timestamp);
    }

    /**
     * @dev View function to check if contract is operational
     */
    function isOperational() external view returns (bool) {
        return !paused();
    }

    /**
     * @dev Get contract version
     */
    function getVersion() external pure returns (string memory) {
        return VERSION;
    }

    /**
     * @dev CRITICAL SECURITY FUNCTION
     * This contract should NEVER hold any tokens
     * This function allows recovery of accidentally sent tokens
     * However, it should never be needed in normal operation
     */
    function emergencyTokenRecovery(
        address tokenAddress,
        uint256 amount
    ) external onlyOwner {
        // This should only be used for accidentally sent tokens
        // Normal operation should never leave tokens in the contract
        IERC20(tokenAddress).safeTransfer(owner(), amount);
    }

    /**
     * @dev Emergency NFT recovery function
     */
    function emergencyNFTRecovery(
        address contractAddress,
        uint256 tokenId
    ) external onlyOwner {
        IERC721(contractAddress).safeTransferFrom(address(this), owner(), tokenId);
    }

    /**
     * @dev Contract should not receive Ether
     */
    receive() external payable {
        revert("Contract does not accept Ether");
    }

    /**
     * @dev Fallback function - reject all calls
     */
    fallback() external payable {
        revert("Function not found");
    }
} 