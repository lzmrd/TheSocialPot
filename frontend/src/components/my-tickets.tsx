"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Ticket, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"

const tickets = [
  {
    id: "1",
    drawDate: "Today, 12:00 AM UTC",
    count: 12,
    txHash: "0x8f7e...3d42",
    status: "pending",
  },
  {
    id: "2",
    drawDate: "Yesterday",
    count: 5,
    txHash: "0x2a9b...7f81",
    status: "not-won",
  },
  {
    id: "3",
    drawDate: "2 days ago",
    count: 8,
    txHash: "0x5c1d...a923",
    status: "not-won",
  },
]

export function MyTickets() {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">My Tickets</h2>
          </div>
          <Link href="/tickets">
            <Button variant="outline" size="sm">
              Buy More
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{ticket.drawDate}</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{ticket.count} Tickets</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.status === "pending"
                      ? "bg-accent/20 text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {ticket.status === "pending" ? "Pending Draw" : "Draw Complete"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">{ticket.txHash}</span>
                <a
                  href={`https://basescan.org/tx/${ticket.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <span className="text-xs">View</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {tickets.length === 0 && (
          <div className="text-center py-12">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No tickets yet</p>
            <Link href="/tickets">
              <Button>Buy Your First Ticket</Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  )
}
