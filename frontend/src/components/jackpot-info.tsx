"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Clock, Users } from "lucide-react"

export function JackpotInfo() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Current Jackpot</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Total Prize</span>
            </div>
            <span className="text-2xl font-bold text-primary">$127,450</span>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Next Drawing</span>
              </div>
              <span className="font-semibold">23h 14m 32s</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Tickets Sold</span>
              </div>
              <span className="font-semibold">1,247</span>
            </div>
          </div>
        </div>

        <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
          <p className="text-xs font-medium text-accent-foreground mb-1">Monthly Payment</p>
          <p className="text-2xl font-bold text-accent">${(127450 / 120).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">For 120 months (10 years)</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Prize pool grows with Aave lending. Actual payouts may increase due to interest earned.
          </p>
        </div>
      </div>
    </Card>
  )
}
