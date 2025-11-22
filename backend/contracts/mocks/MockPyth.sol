// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../../interfaces/IPythEntropy.sol";
import "../../interfaces/IEntropyConsumer.sol";

/**
 * @title MockPyth
 * @notice Mock Pyth Entropy contract for testing using callback pattern
 * @dev Simulates Pyth Entropy V2 callback behavior
 */
contract MockPyth is IPythEntropy {
    // Fee required for requests
    uint256 public override fee;

    // Mapping from sequence number to request info
    mapping(uint64 => RequestInfo) public requests;
    
    // Next sequence number
    uint64 private nextSequenceNumber = 1;
    
    // Blocks to wait before callback (simulate delay)
    uint256 public constant CALLBACK_DELAY = 1;

    struct RequestInfo {
        IEntropyConsumer consumer;
        address provider;
        uint256 userRandomness;
        uint256 callbackBlock;
        bool callbackExecuted;
    }

    event RandomNumberRequested(uint64 indexed sequenceNumber, address indexed consumer);
    event CallbackExecuted(uint64 indexed sequenceNumber, bytes32 randomBytes);

    constructor(uint256 _fee) {
        fee = _fee;
    }

    /**
     * @notice Internal function to handle request logic
     */
    function _doRequest(
        IEntropyConsumer consumer,
        address provider,
        uint256 userRandomness
    ) internal returns (uint64 sequenceNumber) {
        require(msg.value >= fee, "MockPyth: insufficient fee");
        
        sequenceNumber = nextSequenceNumber;
        nextSequenceNumber++;
        
        // Store request info
        requests[sequenceNumber] = RequestInfo({
            consumer: consumer,
            provider: provider,
            userRandomness: userRandomness,
            callbackBlock: block.number + CALLBACK_DELAY,
            callbackExecuted: false
        });
        
        emit RandomNumberRequested(sequenceNumber, address(consumer));
        
        // If delay is 0, execute callback immediately (in same transaction)
        if (CALLBACK_DELAY == 0) {
            _executeCallback(sequenceNumber);
        }
        
        // Refund excess
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }
        
        return sequenceNumber;
    }

    /**
     * @notice Request a random number (implements IPythEntropy)
     */
    function request(
        IEntropyConsumer consumer,
        address provider,
        uint256 userRandomness
    ) external payable override returns (uint64 sequenceNumber) {
        return _doRequest(consumer, provider, userRandomness);
    }

    /**
     * @notice Request a random number with callback (V2)
     */
    function requestV2(
        IEntropyConsumer consumer,
        address provider,
        uint256 userRandomness
    ) external payable override returns (uint64 sequenceNumber) {
        return _doRequest(consumer, provider, userRandomness);
    }

    /**
     * @notice Execute callback for a sequence number (call after advancing blocks)
     * @dev In tests, call this after increasing blocks to simulate Pyth callback
     */
    function executeCallback(uint64 sequenceNumber) external {
        require(block.number >= requests[sequenceNumber].callbackBlock, "MockPyth: callback not ready");
        require(!requests[sequenceNumber].callbackExecuted, "MockPyth: callback already executed");
        _executeCallback(sequenceNumber);
    }

    /**
     * @notice Internal function to execute callback
     */
    function _executeCallback(uint64 sequenceNumber) internal {
        RequestInfo storage requestInfo = requests[sequenceNumber];
        require(requestInfo.callbackBlock > 0, "MockPyth: invalid sequence");
        require(!requestInfo.callbackExecuted, "MockPyth: already executed");

        // Generate deterministic random bytes
        bytes32 randomBytes = keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            block.timestamp,
            sequenceNumber,
            requestInfo.userRandomness,
            address(requestInfo.consumer)
        ));

        // Mark as executed
        requestInfo.callbackExecuted = true;

        // Call consumer's callback function
        requestInfo.consumer.entropyCallback(sequenceNumber, randomBytes);

        emit CallbackExecuted(sequenceNumber, randomBytes);
    }

    /**
     * @notice Check if callback has been executed
     */
    function isRevealed(uint64 sequenceNumber) external view override returns (bool) {
        return requests[sequenceNumber].callbackExecuted;
    }

    /**
     * @notice Set fee (for testing)
     */
    function setFee(uint256 _fee) external {
        fee = _fee;
    }

    /**
     * @notice Check if callback is ready to execute
     */
    function isCallbackReady(uint64 sequenceNumber) external view returns (bool) {
        return block.number >= requests[sequenceNumber].callbackBlock && 
               !requests[sequenceNumber].callbackExecuted;
    }
}
