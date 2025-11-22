import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Web3Provider } from "@/lib/web3-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MegaYield - Smart Lottery with 10-Year Monthly Payouts",
  description:
    "Win daily and receive monthly payments for 10 years. Powered by blockchain technology and Aave lending protocol.",
  generator: "v0.app",
  icons: {
    icon: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        <Web3Provider>{children}</Web3Provider>
        <Analytics />
      </body>
    </html>
  )
}
