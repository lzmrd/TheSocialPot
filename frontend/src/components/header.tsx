"use client"

import Link from "next/link"
import { WalletButton } from "@/components/wallet-button"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="MegaYield" 
                width={48} 
                height={48} 
                className="w-full h-full object-contain" 
                style={{ display: 'block' }}
              />
            </div>
            <span className="text-2xl font-bold text-foreground">MegaYield</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="/tickets" className="text-muted-foreground hover:text-foreground transition-colors">
              Buy Tickets
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </nav>

          <WalletButton />
        </div>
      </div>
    </header>
  )
}
