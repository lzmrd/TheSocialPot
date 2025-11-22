// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IPythEntropy.sol";
import "../interfaces/IEntropyConsumer.sol";

/**
 * @title PythIntegration
 * @notice Simple wrapper for Pyth Entropy random number generation
 * @dev Based on Pyth Entropy best practices: https://docs.pyth.network/entropy/entropy-sol/best-practices
 * This contract acts as a thin wrapper - the callback goes directly to the consumer
 */
contract PythIntegration is Ownable {
    // Pyth Entropy contract
    IPythEntropy public immutable pyth;

    event RandomNumberRequested(uint64 indexed sequenceNumber, address indexed consumer);

    /**
     * @notice Constructor
     * @param _pyth Address of Pyth Entropy contract
     */
    constructor(address _pyth) Ownable(msg.sender) {
        require(_pyth != address(0), "PythIntegration: invalid Pyth address");
        pyth = IPythEntropy(_pyth);
    }

    /**
     * @notice Request a random number from Pyth Entropy
     * @param callbackHandler The contract that will receive the callback (must implement IEntropyConsumer)
     * @param userRandomness Additional user-provided randomness (optional, can be 0)
     * @return sequenceNumber The sequence number for tracking this request
     * @dev The callback will go directly to callbackHandler.entropyCallback()
     */
    function requestRandomNumber(
        IEntropyConsumer callbackHandler,
        uint256 userRandomness
    ) external payable returns (uint64 sequenceNumber) {
        uint256 requiredFee = pyth.fee();
        require(msg.value >= requiredFee, "PythIntegration: insufficient fee");

        // Request random number - Pyth will call callbackHandler.entropyCallback() directly
        sequenceNumber = pyth.requestV2{value: requiredFee}(
            callbackHandler,
            address(0), // provider (use default)
            userRandomness
        );

        // Refund excess ETH if any
        if (msg.value > requiredFee) {
            payable(msg.sender).transfer(msg.value - requiredFee);
        }

        emit RandomNumberRequested(sequenceNumber, address(callbackHandler));
    }

    /**
     * @notice Get the fee required for a request
     * @return fee The fee amount in wei
     */
    function getRequiredFee() external view returns (uint256) {
        return pyth.fee();
    }

    /**
     * @notice Withdraw contract balance (only owner)
     * @param to Address to receive funds
     */
    function withdrawBalance(address payable to) external onlyOwner {
        require(to != address(0), "PythIntegration: invalid recipient");
        to.transfer(address(this).balance);
    }
}
