"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Minus, Plus, Ticket, Users } from "lucide-react"
import { useWeb3 } from "@/lib/web3-provider"

export function TicketPurchase() {
  const [ticketCount, setTicketCount] = useState(1)
  const [referralCode, setReferralCode] = useState("")
  const ticketPrice = 1 // USDC
  const { isConnected, connect } = useWeb3()

  const incrementTickets = () => setTicketCount((prev) => Math.min(prev + 1, 100))
  const decrementTickets = () => setTicketCount((prev) => Math.max(prev - 1, 1))

  const totalCost = ticketCount * ticketPrice
  const jackpotContribution = totalCost * 0.7
  const referralAmount = totalCost * 0.3

  const handleBuyTickets = async () => {
    if (!isConnected) {
      await connect()
      return
    }

    // TODO: Implement smart contract interaction
    console.log("Buying tickets...", { ticketCount, referralCode, totalCost })
  }

  return (
    <Card className="p-6 md:p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Ticket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Purchase Tickets</h2>
            <p className="text-sm text-muted-foreground">1 USDC per ticket</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="ticket-count" className="text-base font-semibold mb-3 block">
              Number of Tickets
            </Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementTickets}
                disabled={ticketCount <= 1}
                className="h-12 w-12 bg-transparent"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                <Input
                  id="ticket-count"
                  type="number"
                  min="1"
                  max="100"
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Math.max(1, Math.min(100, Number.parseInt(e.target.value) || 1)))}
                  className="text-center text-2xl font-bold h-12"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={incrementTickets}
                disabled={ticketCount >= 100}
                className="h-12 w-12"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Maximum 100 tickets per transaction</p>
          </div>

          <div>
            <Label htmlFor="referral-code" className="text-base font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Referral Code (Optional)
            </Label>
            <Input
              id="referral-code"
              placeholder="Enter referral code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Support your friend! They will receive 30% of your ticket cost.
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tickets</span>
              <span className="font-medium">{ticketCount}x</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per ticket</span>
              <span className="font-medium">{ticketPrice} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">To Jackpot (70%)</span>
              <span className="font-medium text-primary">{jackpotContribution.toFixed(2)} USDC</span>
            </div>
            {referralCode && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Referral Bonus (30%)</span>
                <span className="font-medium text-accent">{referralAmount.toFixed(2)} USDC</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border">
            <span className="text-lg font-semibold">Total Cost</span>
            <span className="text-3xl font-bold text-primary">{totalCost} USDC</span>
          </div>
        </div>

        <Button
          onClick={handleBuyTickets}
          className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isConnected ? `Buy ${ticketCount} ${ticketCount === 1 ? "Ticket" : "Tickets"}` : "Connect Wallet to Buy"}
        </Button>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold">What happens next?</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Your tickets are recorded on the blockchain</li>
            <li>• Daily drawing at midnight UTC</li>
            <li>• Winner receives first payment immediately</li>
            <li>• Monthly payments for 10 years via Aave</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
