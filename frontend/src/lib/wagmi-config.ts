import { baseSepolia } from "viem/chains"
import { createConfig, http } from "wagmi"

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
})

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig
  }
}

