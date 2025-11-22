"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, AlertCircle, ExternalLink } from "lucide-react"

export function ClaimPayment() {
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)

  const claimData = {
    availableAmount: 820.42,
    nextClaimDate: "Feb 15, 2025",
    canClaim: true,
    daysUntilNext: 0,
    gasEstimate: 0.0023,
  }

  const handleClaim = async () => {
    setIsClaiming(true)
    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsClaiming(false)
    setClaimed(true)
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Claim Payment</h2>
        </div>

        {!claimed ? (
          <>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">Available to Claim</p>
              <p className="text-4xl font-bold text-primary mb-1">${claimData.availableAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Month 4 Payment</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Claim Period</span>
                <span className="font-medium">{claimData.nextClaimDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Gas</span>
                <span className="font-medium">{claimData.gasEstimate} ETH</span>
              </div>
            </div>

            {claimData.canClaim ? (
              <Button
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleClaim}
                disabled={isClaiming}
              >
                {isClaiming ? "Processing..." : "Claim Payment"}
              </Button>
            ) : (
              <Button className="w-full h-12" disabled>
                Next Claim in {claimData.daysUntilNext} Days
              </Button>
            )}

            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Payments can be claimed once every 30 days. Your funds are safely earning interest on Aave while
                vesting.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-accent/10 rounded-lg p-6 border border-accent/20 text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-accent" />
              </div>
              <p className="text-2xl font-bold text-accent mb-2">Payment Claimed!</p>
              <p className="text-sm text-muted-foreground">
                ${claimData.availableAmount.toLocaleString()} sent to your wallet
              </p>
            </div>

            <a href="#" className="flex items-center justify-center gap-2 text-sm text-primary hover:underline">
              View Transaction
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-1">Next Payment</p>
              <p className="text-xs text-muted-foreground">Available on Mar 15, 2025</p>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
