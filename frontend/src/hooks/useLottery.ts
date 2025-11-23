"use client"

import { useState, useEffect, useRef } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, useChainId } from "wagmi"
import { CONTRACT_ADDRESSES, BASE_SEPOLIA_CHAIN_ID, NETWORK_CONFIG } from "@/config/contracts"
import { formatUSDC } from "@/lib/viem-client"
import lotteryAbi from "@/abis/MegaYieldLottery.json"
import erc20Abi from "@/abis/ERC20.json"

const LOTTERY_ABI = lotteryAbi as any
const ERC20_ABI = erc20Abi as any

// DayInfo interface removed - no longer using getCurrentDayInfo

export function useLottery() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContract, data: hash, isPending: isBuying } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  const isPurchaseTxRef = useRef(false)
  const purchaseTxHashRef = useRef<string | null>(null)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const pendingPurchaseRef = useRef<{ amount: number; referrer?: string } | null>(null)

  const lotteryAddress = CONTRACT_ADDRESSES.baseSepolia.lottery as `0x${string}`
  const usdcAddress = CONTRACT_ADDRESSES.baseSepolia.usdc as `0x${string}`

  // Read contract data
  const { data: ticketPriceData } = useReadContract({
    address: lotteryAddress,
    abi: LOTTERY_ABI,
    functionName: "ticketPrice",
  })
  const ticketPrice = ticketPriceData as bigint | undefined

  const { data: usdcBalanceData } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })
  const usdcBalance = usdcBalanceData as bigint | undefined

  const { data: usdcAllowanceData } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, lotteryAddress] : undefined,
    query: { enabled: !!address },
  })
  const usdcAllowance = usdcAllowanceData as bigint | undefined

  // Watch for ticket purchase events
  useWatchContractEvent({
    address: lotteryAddress,
    abi: LOTTERY_ABI,
    eventName: "TicketPurchased",
    onLogs() {
      // Mark purchase as successful when event is detected and we have a purchase tx hash
      if (isPurchaseTxRef.current && purchaseTxHashRef.current) {
        setPurchaseSuccess(true)
      }
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

  // Refresh when transaction succeeds and handle automatic purchase after approval
  useEffect(() => {
    if (isSuccess && hash) {
      if (purchaseTxHashRef.current === hash) {
        // This was a purchase transaction
        setPurchaseSuccess(true)
        pendingPurchaseRef.current = null // Clear pending purchase
      } else {
        // This was an approval transaction
        
        // If we have a pending purchase, automatically execute it after approval
        if (pendingPurchaseRef.current && ticketPrice && address) {
          const { amount, referrer } = pendingPurchaseRef.current
          const totalCost = BigInt(ticketPrice) * BigInt(amount)
          const referrerAddress = referrer && referrer.trim() 
            ? (referrer.trim() as `0x${string}`) 
            : "0x0000000000000000000000000000000000000000"
          
          // Small delay to ensure allowance is updated on-chain
          const timeoutId = setTimeout(() => {
            // Mark as purchase transaction
            isPurchaseTxRef.current = true
            setPurchaseSuccess(false)
            
            // Buy tickets automatically
            writeContract({
              address: lotteryAddress,
              abi: LOTTERY_ABI,
              functionName: "buyTicket",
              args: [BigInt(amount), referrerAddress],
            })
          }, 2000) // Wait 2 seconds for allowance to be updated on-chain
          
          // Cleanup timeout if component unmounts
          return () => clearTimeout(timeoutId)
        }
      }
    }
  }, [isSuccess, hash, ticketPrice, lotteryAddress, address, writeContract])

  const buyTickets = async (amount: number, referrer?: string) => {
    if (!address || !ticketPrice) {
      throw new Error("Wallet not connected")
    }

    const totalCost = BigInt(ticketPrice) * BigInt(amount)
    const referrerAddress = referrer && referrer.trim() ? (referrer.trim() as `0x${string}`) : "0x0000000000000000000000000000000000000000"

    // Check if we need to approve
    if (!usdcAllowance || usdcAllowance < totalCost) {
      // Approve USDC - this is NOT a purchase transaction
      isPurchaseTxRef.current = false
      setPurchaseSuccess(false)
      
      // Store the purchase parameters to use after approval
      pendingPurchaseRef.current = { amount, referrer }
      
      // Approve USDC
      writeContract({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [lotteryAddress, totalCost],
      })
      
      // The useEffect will automatically call buyTicket after approval is confirmed
      return
    }

    // Reset purchase success state and mark this as a purchase transaction
    setPurchaseSuccess(false)
    isPurchaseTxRef.current = true
    pendingPurchaseRef.current = null // Clear any pending purchase

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
    ticketPrice: ticketPrice || null,
    usdcBalance: usdcBalance || null,
    usdcAllowance: usdcAllowance || null,
    isLoading: !ticketPrice,
    isBuying: isBuying || isConfirming,
    buyTickets,
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

