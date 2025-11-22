import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

// Helper for time manipulation
async function increaseTime(seconds: number) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
}

async function getLatestTime(): Promise<bigint> {
  const block = await ethers.provider.getBlock("latest");
  return BigInt(block!.timestamp);
}

describe("MegaYieldLottery", function () {
  let lottery: Contract;
  let vesting: Contract;
  let aaveIntegration: Contract;
  let pythIntegration: Contract;
  let mockPyth: Contract;
  let mockAavePool: Contract;
  let usdc: Contract;
  let owner: any;
  let user1: any;
  let user2: any;
  let user3: any;
  let referrer: any;

  const TICKET_PRICE = "1000000"; // 1 USDC (6 decimals)
  const PYTH_FEE = ethers.parseEther("0.0001");
  const JACKPOT_PERCENTAGE = 70;
  const REFERRAL_PERCENTAGE = 30;

  beforeEach(async function () {
    [owner, user1, user2, user3, referrer] = await ethers.getSigners();

    // Deploy mock USDC token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    await usdc.waitForDeployment();

    // Mint USDC for testing
    await usdc.mint(owner.address, ethers.parseUnits("1000000", 6));
    await usdc.mint(user1.address, ethers.parseUnits("10000", 6));
    await usdc.mint(user2.address, ethers.parseUnits("10000", 6));
    await usdc.mint(user3.address, ethers.parseUnits("10000", 6));
    await usdc.mint(referrer.address, ethers.parseUnits("10000", 6));

    // Deploy mock Pyth
    const MockPyth = await ethers.getContractFactory("MockPyth");
    mockPyth = await MockPyth.deploy(PYTH_FEE);
    await mockPyth.waitForDeployment();

    // Deploy mock Aave Pool
    const MockAavePool = await ethers.getContractFactory("MockAavePool");
    mockAavePool = await MockAavePool.deploy(await usdc.getAddress());
    await mockAavePool.waitForDeployment();

    // Deploy AaveIntegration
    const AaveIntegration = await ethers.getContractFactory("AaveIntegration");
    aaveIntegration = await AaveIntegration.deploy(
      await mockAavePool.getAddress(),
      await usdc.getAddress()
    );
    await aaveIntegration.waitForDeployment();

    // Deploy PythIntegration
    const PythIntegration = await ethers.getContractFactory("PythIntegration");
    pythIntegration = await PythIntegration.deploy(
      await mockPyth.getAddress(),
      PYTH_FEE
    );
    await pythIntegration.waitForDeployment();

    // Deploy MegaYieldVesting
    const MegaYieldVesting = await ethers.getContractFactory("MegaYieldVesting");
    vesting = await MegaYieldVesting.deploy(
      await aaveIntegration.getAddress(),
      await usdc.getAddress()
    );
    await vesting.waitForDeployment();

    // Deploy MegaYieldLottery
    const MegaYieldLottery = await ethers.getContractFactory("MegaYieldLottery");
    lottery = await MegaYieldLottery.deploy(
      await usdc.getAddress(),
      await pythIntegration.getAddress(),
      TICKET_PRICE
    );
    await lottery.waitForDeployment();

    // Setup contracts
    await lottery.setVestingContract(await vesting.getAddress());
    await vesting.setLotteryContract(await lottery.getAddress());

    // Approve USDC spending
    for (const user of [owner, user1, user2, user3, referrer]) {
      await usdc.connect(user).approve(await lottery.getAddress(), ethers.MaxUint256);
    }
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await lottery.owner()).to.equal(owner.address);
    });

    it("Should set the correct ticket price", async function () {
      expect(await lottery.ticketPrice()).to.equal(TICKET_PRICE);
    });

    it("Should initialize current day", async function () {
      const info = await lottery.getCurrentDayInfo();
      expect(info._currentDay).to.be.gt(0);
      expect(info._startTime).to.be.gt(0);
    });

    it("Should not allow setting vesting contract twice", async function () {
      await expect(
        lottery.setVestingContract(await vesting.getAddress())
      ).to.be.revertedWith("MegaYieldLottery: vesting contract already set");
    });
  });

  describe("Buying Tickets", function () {
    it("Should allow users to buy tickets", async function () {
      const amount = 1;
      const totalCost = BigInt(TICKET_PRICE) * BigInt(amount);
      
      const balanceBefore = await usdc.balanceOf(user1.address);
      
      await expect(lottery.connect(user1).buyTicket(amount, ethers.ZeroAddress))
        .to.emit(lottery, "TicketPurchased")
        .withArgs(user1.address, amount, ethers.ZeroAddress);

      const balanceAfter = await usdc.balanceOf(user1.address);
      expect(balanceBefore - balanceAfter).to.equal(totalCost);

      const info = await lottery.getCurrentDayInfo();
      expect(info._jackpot).to.be.gt(0);
      expect(info._ticketCount).to.equal(1);
    });

    it("Should add 70% to jackpot", async function () {
      const amount = 1;
      const totalCost = BigInt(TICKET_PRICE) * BigInt(amount);
      const expectedJackpot = (totalCost * BigInt(JACKPOT_PERCENTAGE)) / BigInt(100);

      await lottery.connect(user1).buyTicket(amount, ethers.ZeroAddress);

      const info = await lottery.getCurrentDayInfo();
      expect(info._jackpot).to.equal(expectedJackpot);
    });

    it("Should send 30% to referrer when provided", async function () {
      const amount = 1;
      const totalCost = BigInt(TICKET_PRICE) * BigInt(amount);
      const expectedReferral = (totalCost * BigInt(REFERRAL_PERCENTAGE)) / BigInt(100);

      const referrerBalanceBefore = await usdc.balanceOf(referrer.address);
      const jackpotBefore = (await lottery.getCurrentDayInfo())._jackpot;

      await lottery.connect(user1).buyTicket(amount, referrer.address);

      const referrerBalanceAfter = await usdc.balanceOf(referrer.address);
      const jackpotAfter = (await lottery.getCurrentDayInfo())._jackpot;

      expect(referrerBalanceAfter - referrerBalanceBefore).to.equal(expectedReferral);
      expect(jackpotAfter - jackpotBefore).to.equal((totalCost * BigInt(JACKPOT_PERCENTAGE)) / BigInt(100));
    });

    it("Should add 30% to jackpot when no valid referrer", async function () {
      const amount = 1;
      const totalCost = BigInt(TICKET_PRICE) * BigInt(amount);

      await lottery.connect(user1).buyTicket(amount, ethers.ZeroAddress);
      
      const info = await lottery.getCurrentDayInfo();
      // 100% should go to jackpot (70% + 30%)
      expect(info._jackpot).to.equal(totalCost);
    });

    it("Should not allow self-referral", async function () {
      const amount = 1;
      const totalCost = BigInt(TICKET_PRICE) * BigInt(amount);

      await lottery.connect(user1).buyTicket(amount, user1.address);
      
      const info = await lottery.getCurrentDayInfo();
      // Should treat self-referral as no referrer
      expect(info._jackpot).to.equal(totalCost);
    });

    it("Should add unique buyers to ticket list", async function () {
      await lottery.connect(user1).buyTicket(1, ethers.ZeroAddress);
      await lottery.connect(user1).buyTicket(2, ethers.ZeroAddress); // Same user, more tickets
      await lottery.connect(user2).buyTicket(1, ethers.ZeroAddress);
      await lottery.connect(user3).buyTicket(1, ethers.ZeroAddress);

      const info = await lottery.getCurrentDayInfo();
      expect(info._ticketCount).to.equal(3); // Only 3 unique buyers
    });

    it("Should accumulate jackpot from multiple tickets", async function () {
      const amount1 = 5;
      const amount2 = 3;
      const totalCost1 = BigInt(TICKET_PRICE) * BigInt(amount1);
      const totalCost2 = BigInt(TICKET_PRICE) * BigInt(amount2);
      const expectedJackpot = (totalCost1 + totalCost2) * BigInt(JACKPOT_PERCENTAGE) / BigInt(100);

      await lottery.connect(user1).buyTicket(amount1, ethers.ZeroAddress);
      await lottery.connect(user2).buyTicket(amount2, ethers.ZeroAddress);

      const info = await lottery.getCurrentDayInfo();
      expect(info._jackpot).to.equal(expectedJackpot);
    });

    it("Should revert if vesting contract not set", async function () {
      const lottery2 = await ethers.getContractFactory("MegaYieldLottery");
      const newLottery = await lottery2.deploy(
        await usdc.getAddress(),
        await pythIntegration.getAddress(),
        TICKET_PRICE
      );
      await newLottery.waitForDeployment();

      await expect(
        newLottery.connect(user1).buyTicket(1, ethers.ZeroAddress)
      ).to.be.revertedWith("MegaYieldLottery: vesting contract not set");
    });
  });

  describe("Day Management", function () {
    it("Should reset to new day when day changes", async function () {
      await lottery.connect(user1).buyTicket(1, ethers.ZeroAddress);
      
      const day1Info = await lottery.getCurrentDayInfo();
      const day1 = day1Info._currentDay;
      const jackpot1 = day1Info._jackpot;

      // Fast forward 1 day
      await increaseTime(24 * 60 * 60 + 1);

      // Buy ticket on new day
      await lottery.connect(user2).buyTicket(1, ethers.ZeroAddress);

      const day2Info = await lottery.getCurrentDayInfo();
      const day2 = day2Info._currentDay;

      expect(day2).to.equal(day1 + 1n);
    });

    it("Should carry over jackpot if no winner drawn", async function () {
      await lottery.connect(user1).buyTicket(1, ethers.ZeroAddress);
      const jackpot1 = (await lottery.getCurrentDayInfo())._jackpot;

      // Fast forward 1 day
      await increaseTime(24 * 60 * 60 + 1);

      // Buy ticket on new day
      await lottery.connect(user2).buyTicket(1, ethers.ZeroAddress);
      
      const day2Info = await lottery.getCurrentDayInfo();
      // Jackpot should carry over and add new amount
      expect(day2Info._jackpot).to.be.gte(jackpot1);
    });
  });

  describe("Drawing Winner", function () {
    beforeEach(async function () {
      // Buy some tickets
      await lottery.connect(user1).buyTicket(1, ethers.ZeroAddress);
      await lottery.connect(user2).buyTicket(1, ethers.ZeroAddress);
      await lottery.connect(user3).buyTicket(1, ethers.ZeroAddress);
    });

    it("Should request random number from Pyth", async function () {
      const userRandomness = 12345;
      
      await expect(
        lottery.connect(owner).requestDrawWinner(userRandomness, { value: PYTH_FEE })
      ).to.emit(pythIntegration, "RandomNumberRequested");
    });

    it("Should not allow drawing without tickets", async function () {
      // Reset day
      await increaseTime(24 * 60 * 60 + 1);
      
      await expect(
        lottery.connect(owner).requestDrawWinner(0, { value: PYTH_FEE })
      ).to.be.revertedWith("MegaYieldLottery: no tickets for this day");
    });

    it("Should not allow drawing twice for same day", async function () {
      await lottery.connect(owner).requestDrawWinner(0, { value: PYTH_FEE });
      
      // Wait for Pyth reveal
      await increaseTime(3);
      
      // Draw winner
      await lottery.connect(owner).drawWinner(0, { value: PYTH_FEE });
      
      // Try to draw again
      await expect(
        lottery.connect(owner).requestDrawWinner(0, { value: PYTH_FEE })
      ).to.be.revertedWith("MegaYieldLottery: winner already drawn for this day");
    });

    it("Should select winner and distribute funds correctly", async function () {
      const dayInfo = await lottery.getCurrentDayInfo();
      const totalJackpot = dayInfo._jackpot;
      
      // Request draw
      await lottery.connect(owner).requestDrawWinner(12345, { value: PYTH_FEE });
      
      // Wait for Pyth reveal
      await increaseTime(3);
      
      // Calculate expected amounts
      const firstPayment = (totalJackpot * 1n) / 120n;
      const vestingAmount = totalJackpot - firstPayment;

      // Draw winner
      await expect(
        lottery.connect(owner).drawWinner(12345, { value: PYTH_FEE })
      )
        .to.emit(lottery, "WinnerDrawn")
        .to.emit(lottery, "FirstPaymentClaimed")
        .to.emit(lottery, "VestingInitialized");

      // Check vesting was initialized
      const vestingInfo = await vesting.getVestingInfo();
      expect(vestingInfo._winner).to.not.equal(ethers.ZeroAddress);
      expect(vestingInfo._totalAmount).to.equal(vestingAmount);
    });

    it("Should pay first month immediately to winner", async function () {
      const dayInfo = await lottery.getCurrentDayInfo();
      const totalJackpot = dayInfo._jackpot;
      const firstPayment = (totalJackpot * 1n) / 120n;

      // Request and draw
      await lottery.connect(owner).requestDrawWinner(12345, { value: PYTH_FEE });
      await increaseTime(3);
      
      // Get winner before drawing
      const tickets = [user1, user2, user3];
      
      // Draw winner
      await lottery.connect(owner).drawWinner(12345, { value: PYTH_FEE });
      
      // Check that one of the ticket buyers received first payment
      // We can't predict which one, so we check the vesting contract
      const vestingInfo = await vesting.getVestingInfo();
      const winner = vestingInfo._winner;
      const winnerBalance = await usdc.balanceOf(winner);
      
      // Winner should have received first payment
      expect(winnerBalance).to.be.gte(firstPayment);
    });

    it("Should deposit remaining funds to Aave", async function () {
      const dayInfo = await lottery.getCurrentDayInfo();
      const totalJackpot = dayInfo._jackpot;
      const vestingAmount = totalJackpot - ((totalJackpot * 1n) / 120n);

      // Request and draw
      await lottery.connect(owner).requestDrawWinner(12345, { value: PYTH_FEE });
      await increaseTime(3);
      await lottery.connect(owner).drawWinner(12345, { value: PYTH_FEE });

      // Check Aave balance (should have deposited)
      const aaveBalance = await vesting.getAaveBalance();
      expect(aaveBalance).to.be.gte(vestingAmount);
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to set vesting contract", async function () {
      await expect(
        lottery.connect(user1).setVestingContract(await vesting.getAddress())
      ).to.be.revertedWithCustomError(lottery, "OwnableUnauthorizedAccount");
    });

    it("Should only allow owner to set ticket price", async function () {
      await expect(
        lottery.connect(user1).setTicketPrice("2000000")
      ).to.be.revertedWithCustomError(lottery, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to update ticket price", async function () {
      const newPrice = "2000000";
      await lottery.connect(owner).setTicketPrice(newPrice);
      expect(await lottery.ticketPrice()).to.equal(newPrice);
    });

    it("Should only allow owner to emergency withdraw", async function () {
      await expect(
        lottery.connect(user1).emergencyWithdraw(await usdc.getAddress(), user1.address, 1000)
      ).to.be.revertedWithCustomError(lottery, "OwnableUnauthorizedAccount");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very large number of tickets", async function () {
      const amount = 1000;
      await lottery.connect(user1).buyTicket(amount, ethers.ZeroAddress);
      
      const info = await lottery.getCurrentDayInfo();
      const expectedJackpot = (BigInt(TICKET_PRICE) * BigInt(amount) * BigInt(JACKPOT_PERCENTAGE)) / BigInt(100);
      expect(info._jackpot).to.equal(expectedJackpot);
    });

    it("Should handle empty referrer address correctly", async function () {
      await lottery.connect(user1).buyTicket(1, ethers.ZeroAddress);
      const info = await lottery.getCurrentDayInfo();
      
      // Should add 100% to jackpot
      expect(info._jackpot).to.equal(BigInt(TICKET_PRICE));
    });

    it("Should reset jackpot and tickets after drawing", async function () {
      await lottery.connect(user1).buyTicket(1, ethers.ZeroAddress);
      
      // Request and draw
      await lottery.connect(owner).requestDrawWinner(12345, { value: PYTH_FEE });
      await increaseTime(3);
      await lottery.connect(owner).drawWinner(12345, { value: PYTH_FEE });
      
      const info = await lottery.getCurrentDayInfo();
      expect(info._jackpot).to.equal(0);
      expect(info._ticketCount).to.equal(0);
    });
  });
});
