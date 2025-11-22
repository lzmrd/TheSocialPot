"use client"

import { useState, useEffect, useRef } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, useChainId } from "wagmi"
import { CONTRACT_ADDRESSES, BASE_SEPOLIA_CHAIN_ID, NETWORK_CONFIG } from "@/config/contracts"
import { formatUSDC } from "@/lib/viem-client"
import lotteryAbi from "@/abis/MegaYieldLottery.json"
import erc20Abi from "@/abis/ERC20.json"

const LOTTERY_ABI = lotteryAbi as any
const ERC20_ABI = erc20Abi as any

export interface DayInfo {
  currentDay: bigint
  jackpot: bigint
  ticketCount: bigint
  startTime: bigint
}

export function useLottery() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContract, data: hash, isPending: isBuying } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  const isPurchaseTxRef = useRef(false)
  const purchaseTxHashRef = useRef<string | null>(null)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)

  const lotteryAddress = CONTRACT_ADDRESSES.baseSepolia.lottery as `0x${string}`
  const usdcAddress = CONTRACT_ADDRESSES.baseSepolia.usdc as `0x${string}`

  // Read contract data
  const { data: dayInfoData, refetch: refetchDayInfo } = useReadContract({
    address: lotteryAddress,
    abi: LOTTERY_ABI,
    functionName: "getCurrentDayInfo",
  })

  const { data: ticketPrice } = useReadContract({
    address: lotteryAddress,
    abi: LOTTERY_ABI,
    functionName: "ticketPrice",
  })

  const { data: usdcBalance } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: usdcAllowance } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, lotteryAddress] : undefined,
    query: { enabled: !!address },
  })

  // Watch for ticket purchase events
  useWatchContractEvent({
    address: lotteryAddress,
    abi: LOTTERY_ABI,
    eventName: "TicketPurchased",
    onLogs() {
      refetchDayInfo()
      // Mark purchase as successful when event is detected and we have a purchase tx hash
      if (isPurchaseTxRef.current && purchaseTxHashRef.current) {
        setPurchaseSuccess(true)
      }
    },
  })

  // Watch for winner drawn events
  useWatchContractEvent({
    address: lotteryAddress,
    abi: LOTTERY_ABI,
    eventName: "WinnerDrawn",
    onLogs() {
      refetchDayInfo()
    },
  })

  // Track purchase transaction hash when it's set
  useEffect(() => {
    if (hash && isPurchaseTxRef.current && purchaseTxHashRef.current !== hash) {
      // This is a purchase transaction, save the hash
      purchaseTxHashRef.current = hash
    } else if (hash && !isPurchaseTxRef.current) {
      // This is an approval transaction, clear purchase hash
      purchaseTxHashRef.current = null
    }
  }, [hash])

  // Refresh when transaction succeeds
  useEffect(() => {
    if (isSuccess && hash && purchaseTxHashRef.current === hash) {
      refetchDayInfo()
      // If this is a purchase transaction (not approval), mark as successful
      setPurchaseSuccess(true)
    } else if (isSuccess && hash) {
      // This was an approval, just refresh data
      refetchDayInfo()
    }
  }, [isSuccess, hash, refetchDayInfo])

  const dayInfo: DayInfo | null = dayInfoData
    ? {
        currentDay: dayInfoData[0],
        jackpot: dayInfoData[1],
        ticketCount: dayInfoData[2],
        startTime: dayInfoData[3],
      }
    : null

  const buyTickets = async (amount: number, referrer?: string) => {
    if (!address || !ticketPrice) {
      throw new Error("Wallet not connected")
    }

    const totalCost = ticketPrice * BigInt(amount)
    const referrerAddress = referrer && referrer.trim() ? (referrer.trim() as `0x${string}`) : "0x0000000000000000000000000000000000000000"

    // Check if we need to approve
    if (!usdcAllowance || usdcAllowance < totalCost) {
      // Approve USDC - this is NOT a purchase transaction
      isPurchaseTxRef.current = false
      setPurchaseSuccess(false)
      writeContract({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [lotteryAddress, totalCost],
      })
      // Wait for approval before buying
      return
    }

    // Reset purchase success state and mark this as a purchase transaction
    setPurchaseSuccess(false)
    isPurchaseTxRef.current = true

    // Buy tickets
    writeContract({
      address: lotteryAddress,
      abi: LOTTERY_ABI,
      functionName: "buyTicket",
      args: [BigInt(amount), referrerAddress],
    })
  }

  // Get explorer URL for current chain
  const explorerUrl = NETWORK_CONFIG[chainId as keyof typeof NETWORK_CONFIG]?.explorerUrl || "https://basescan.org"

  return {
    dayInfo,
    ticketPrice: ticketPrice || null,
    usdcBalance: usdcBalance || null,
    usdcAllowance: usdcAllowance || null,
    isLoading: !dayInfoData || !ticketPrice,
    isBuying: isBuying || isConfirming,
    buyTickets,
    refreshData: refetchDayInfo,
    formattedJackpot: dayInfo ? formatUSDC(dayInfo.jackpot) : "0.00",
    formattedBalance: usdcBalance ? formatUSDC(usdcBalance) : "0.00",
    // New fields for purchase success tracking
    purchaseTxHash: purchaseSuccess && purchaseTxHashRef.current ? purchaseTxHashRef.current : null,
    purchaseSuccess,
    explorerUrl,
    resetPurchaseSuccess: () => {
      setPurchaseSuccess(false)
      isPurchaseTxRef.current = false
      purchaseTxHashRef.current = null
    },
  }
}

