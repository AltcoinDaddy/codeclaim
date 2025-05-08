"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Share2, CheckCircle2, Users, Trophy, Twitter, MessageSquare } from "lucide-react"
import { CodeDisplay } from "./code-display"

interface ReferralSystemProps {
  className?: string
  referralCode?: string
}

export function ReferralSystem({ className, referralCode: initialReferralCode = "DEVREWARD" }: ReferralSystemProps) {
  const [copied, setCopied] = useState(false)
  const [referrals, setReferrals] = useState(0)

  const referralLink = `https://codeclaim.dev/waitlist?ref=${initialReferralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Simulate adding a referral for demo purposes
  const simulateReferral = () => {
    setReferrals((prev) => prev + 1)
  }

  const referralCodeDisplay = `
const referralSystem = {
  code: "${initialReferralCode}",
  referrals: ${referrals},
  pointsPerReferral: 100,
  
  calculatePoints: function() {
    return this.referrals * this.pointsPerReferral;
  },
  
  getTotalPoints: function() {
    return this.calculatePoints();
  },
  
  shareReferral: function(platform) {
    console.log(\`Sharing referral code \${this.code} on \${platform}\`);
    // Implementation for sharing on different platforms
    return true;
  }
};

// Current points calculation
const totalPoints = referralSystem.calculatePoints();
console.log(\`You have earned \${totalPoints} points!\`);
`

  return (
    <div className={cn("", className)}>
      <CodeDisplay code={referralCodeDisplay} prompt="codeclaim@dev:~/referrals$" className="mb-6" />

      <div className="mb-6">
        <h3 className="text-lg mb-2">Your Referral Program</h3>
        <p className="text-sm text-gray-400 mb-4">
          Share your unique code and earn 100 points for each successful referral.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 bg-[#1e1e1e] border border-[#30363d] rounded-md p-4">
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              <h4>Referrals</h4>
            </div>
            <p className="text-2xl">{referrals}</p>
          </div>

          <div className="flex-1 bg-[#1e1e1e] border border-[#30363d] rounded-md p-4">
            <div className="flex items-center mb-2">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              <h4>Points</h4>
            </div>
            <p className="text-2xl">{referrals * 100}</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm mb-2 block">Your Referral Code</label>
          <div className="flex">
            <Input
              value={initialReferralCode}
              readOnly
              className="bg-[#1e1e1e] border-[#30363d] border-r-0 rounded-r-none"
            />
            <Button variant="outline" className="rounded-l-none border-[#30363d]" onClick={handleCopy}>
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm mb-2 block">Shareable Link</label>
          <div className="flex">
            <Input
              value={referralLink}
              readOnly
              className="bg-[#1e1e1e] border-[#30363d] border-r-0 rounded-r-none text-xs sm:text-sm"
            />
            <Button variant="outline" className="rounded-l-none border-[#30363d]" onClick={handleCopy}>
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={simulateReferral}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Link
          </Button>
          <Button variant="outline" className="flex-1">
            <Twitter className="h-4 w-4 mr-2" />
            Share on X
          </Button>
          <Button variant="outline" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            Share on Telegram
          </Button>
        </div>
      </div>
    </div>
  )
}
