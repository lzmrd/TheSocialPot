"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Web3ContextType {
  account: string | null
  isConnected: boolean
  isConnecting: boolean
  chainId: number | null
  connect: () => Promise<void>
  disconnect: () => void
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Check if wallet was previously connected
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          })
          if (accounts.length > 0) {
            setAccount(accounts[0])
            const chainIdHex = await window.ethereum.request({
              method: "eth_chainId",
            })
            setChainId(Number.parseInt(chainIdHex, 16))
          }
        } catch (error) {
          console.error("Error checking connection:", error)
        }
      }
    }

    checkConnection()

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
        } else {
          setAccount(null)
        }
      })

      window.ethereum.on("chainChanged", (chainIdHex: string) => {
        setChainId(Number.parseInt(chainIdHex, 16))
        window.location.reload()
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {})
        window.ethereum.removeListener("chainChanged", () => {})
      }
    }
  }, [])

  const connect = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet")
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      setAccount(accounts[0])

      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      })
      const currentChainId = Number.parseInt(chainIdHex, 16)
      setChainId(currentChainId)

      // Base Mainnet chainId is 8453, Base Sepolia is 84532
      const targetChainId = 8453 // Base Mainnet
      if (currentChainId !== targetChainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${targetChainId.toString(16)}` }],
          })
        } catch (switchError: any) {
          // Chain not added to wallet, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${targetChainId.toString(16)}`,
                  chainName: "Base",
                  nativeCurrency: {
                    name: "Ether",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://mainnet.base.org"],
                  blockExplorerUrls: ["https://basescan.org"],
                },
              ],
            })
          }
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setChainId(null)
  }

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnected: !!account,
        isConnecting,
        chainId,
        connect,
        disconnect,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

declare global {
  interface Window {
    ethereum?: any
  }
}
