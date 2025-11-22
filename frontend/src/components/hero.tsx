import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/10 via-background to-primary/5" />

      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            Powered by Aave Lending Protocol
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
            Win Today, <span className="text-primary">Earn</span> for 10 Years
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
            {
              "The smart lottery that pays you monthly. Buy tickets for just 1 USDC, win daily drawings, and receive guaranteed monthly payments for 120 months through DeFi lending."
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/tickets">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
                Buy Tickets Now
              </Button>
            </Link>
            <Link href="/#how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">$127,450</div>
              <div className="text-sm text-muted-foreground">Current Jackpot</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">23h 14m</div>
              <div className="text-sm text-muted-foreground">Next Drawing</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">1,247</div>
              <div className="text-sm text-muted-foreground">Tickets Sold Today</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
