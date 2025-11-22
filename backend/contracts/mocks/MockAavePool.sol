// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../interfaces/IAavePool.sol";

/**
 * @title MockAavePool
 * @notice Mock Aave Pool for testing
 */
contract MockAavePool is IAavePool {
    // Mock aToken
    ERC20 public aToken;
    
    // Underlying asset
    IERC20 public underlyingAsset;
    
    // Normalized income (1e27 = no interest, grows over time)
    uint256 public normalizedIncome = 1e27;
    
    // Annual interest rate (e.g., 500 = 5%)
    uint256 public annualInterestRate = 500; // 5%
    
    // Last update timestamp
    uint256 public lastUpdateTimestamp;
    
    // Reserve data
    mapping(address => ReserveData) public reserves;

    constructor(address _underlyingAsset) {
        underlyingAsset = IERC20(_underlyingAsset);
        lastUpdateTimestamp = block.timestamp;
        
        // Deploy mock aToken
        string memory symbol = string(abi.encodePacked("a", ERC20(_underlyingAsset).symbol()));
        aToken = new MockAToken(symbol, symbol, ERC20(_underlyingAsset).decimals());
        
        // Set reserve data
        ReserveData storage reserve = reserves[_underlyingAsset];
        reserve.aTokenAddress = address(aToken);
        reserve.liquidityIndex = 1e27;
    }

    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external override {
        require(asset == address(underlyingAsset), "MockAavePool: wrong asset");
        
        // Transfer underlying from caller
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        
        // Update normalized income based on time passed
        _updateNormalizedIncome();
        
        // Calculate aToken amount based on normalized income
        uint256 aTokenAmount = (amount * 1e27) / normalizedIncome;
        
        // Mint aTokens
        MockAToken(address(aToken)).mint(onBehalfOf, aTokenAmount);
    }

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external override returns (uint256) {
        require(asset == address(underlyingAsset), "MockAavePool: wrong asset");
        
        // Update normalized income
        _updateNormalizedIncome();
        
        uint256 aTokenBalance = aToken.balanceOf(msg.sender);
        require(aTokenBalance > 0, "MockAavePool: no aTokens");
        
        // Calculate underlying amount
        uint256 underlyingAmount;
        if (amount == type(uint256).max) {
            // Withdraw all
            underlyingAmount = (aTokenBalance * normalizedIncome) / 1e27;
            amount = aTokenBalance;
        } else {
            underlyingAmount = (amount * normalizedIncome) / 1e27;
        }
        
        // Burn aTokens
        MockAToken(address(aToken)).burnFrom(msg.sender, amount);
        
        // Transfer underlying
        IERC20(asset).transfer(to, underlyingAmount);
        
        return underlyingAmount;
    }

    function getReserveNormalizedIncome(address asset) external view override returns (uint256) {
        return normalizedIncome;
    }

    function getReserveData(address asset) external view override returns (ReserveData memory) {
        return reserves[asset];
    }

    function _updateNormalizedIncome() internal {
        uint256 timePassed = block.timestamp - lastUpdateTimestamp;
        if (timePassed > 0) {
            // Simple interest calculation: normalizedIncome grows by annualInterestRate/year
            // normalizedIncome = normalizedIncome * (1 + annualInterestRate / 10000) ^ (timePassed / 365 days)
            // For simplicity, we use linear approximation
            uint256 interestPerSecond = (normalizedIncome * annualInterestRate) / (10000 * 365 days);
            normalizedIncome = normalizedIncome + (interestPerSecond * timePassed);
        }
        lastUpdateTimestamp = block.timestamp;
    }

    function setInterestRate(uint256 _rate) external {
        annualInterestRate = _rate; // basis points (100 = 1%)
        _updateNormalizedIncome();
    }
}

/**
 * @title MockAToken
 * @notice Mock aToken for testing
 */
contract MockAToken is ERC20 {
    uint8 private _decimals;

    constructor(string memory name, string memory symbol, uint8 decimals_) ERC20(name, symbol) {
        _decimals = decimals_;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burnFrom(address from, uint256 amount) external {
        _burn(from, amount);
    }
}

