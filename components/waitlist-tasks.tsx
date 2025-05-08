"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DiscIcon as Discord,
  MessageSquare,
  Twitter,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { CodeDisplay } from "./code-display"

interface WaitlistTasksProps {
  className?: string
  onComplete?: (data: FormData) => void
}

type Task = {
  id: string
  title: string
  description: string
  icon: React.ElementType
  buttonText: string
  url: string
}

export function WaitlistTasks({ className, onComplete }: WaitlistTasksProps) {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    discord: false,
    telegram: false,
    twitter: false,
  })
  const [walletAddress, setWalletAddress] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const tasks: Task[] = [
    {
      id: "discord",
      title: "Join Discord",
      description: "Join our Discord community for updates and discussions",
      icon: Discord,
      buttonText: "Join Discord",
      url: "https://discord.gg/codeclaim",
    },
    {
      id: "telegram",
      title: "Join Telegram",
      description: "Join our Telegram channel for important announcements",
      icon: MessageSquare,
      buttonText: "Join Telegram",
      url: "https://t.me/codeclaim",
    },
    {
      id: "twitter",
      title: "Follow on X/Twitter",
      description: "Follow us on X/Twitter and retweet our pinned post",
      icon: Twitter,
      buttonText: "Follow on X",
      url: "https://twitter.com/codeclaim",
    },
  ]

  const markTaskComplete = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: true,
    }))
  }

  const allTasksCompleted = Object.values(completedTasks).every(Boolean)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (allTasksCompleted && walletAddress) {
      setSubmitted(true)
      if (onComplete) {
        const formData = new FormData()
        formData.append("wallet", walletAddress)
        Object.keys(completedTasks).forEach((task) => {
          formData.append(task, "completed")
        })
        onComplete(formData)
      }
    }
  }

  const taskCode = `
const waitlistTasks = {
  tasks: [
    { id: "discord", completed: ${completedTasks.discord} },
    { id: "telegram", completed: ${completedTasks.telegram} },
    { id: "twitter", completed: ${completedTasks.twitter} }
  ],
  
  wallet: "${walletAddress || ""}",
  
  checkAllCompleted: function() {
    return this.tasks.every(task => task.completed);
  },
  
  canSubmit: function() {
    return this.checkAllCompleted() && this.wallet.length > 0;
  },
  
  submit: function() {
    if (!this.canSubmit()) {
      return { success: false, message: "Complete all tasks first" };
    }
    
    return { 
      success: true, 
      message: "Successfully joined waitlist!" 
    };
  }
};

// Check if all tasks are completed
const allCompleted = waitlistTasks.checkAllCompleted();
console.log(\`All tasks completed: \${allCompleted}\`);
`

  return (
    <div className={cn("", className)}>
      <div className="mb-6">
        <CodeDisplay code={taskCode} prompt="codeclaim@dev:~/waitlist$" className="mb-6" />

        {!submitted ? (
          <>
            <h2 className="text-xl font-bold mb-4">Complete Tasks to Join Waitlist</h2>
            <p className="text-gray-400 mb-6">
              Follow these steps to join the Codeclaim waitlist and earn rewards for your open source contributions.
            </p>

            <div className="space-y-4 mb-6">
              {tasks.map((task) => (
                <div key={task.id} className={cn("task-item", completedTasks[task.id] && "task-complete")}>
                  <div className="task-icon">
                    {completedTasks[task.id] ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : (
                      <task.icon className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{task.title}</h3>
                    <p className="text-sm text-gray-400">{task.description}</p>
                  </div>
                  <Button
                    variant={completedTasks[task.id] ? "outline" : "default"}
                    size="sm"
                    onClick={() => markTaskComplete(task.id)}
                    disabled={completedTasks[task.id]}
                    className="whitespace-nowrap"
                  >
                    {completedTasks[task.id] ? (
                      "Completed"
                    ) : (
                      <>
                        {task.buttonText} <ExternalLink className="ml-1 h-3 w-3" />
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="wallet" className="block font-bold">
                  Wallet Address
                </label>
                <Input
                  id="wallet"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="bg-[#1e1e1e] border-[#30363d]"
                  disabled={!allTasksCompleted}
                />
                {!allTasksCompleted && (
                  <div className="flex items-center text-amber-500 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Complete all tasks to enable wallet submission
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={!allTasksCompleted || !walletAddress}>
                <Wallet className="mr-2 h-4 w-4" />
                Submit Wallet Address
              </Button>
            </form>
          </>
        ) : (
          <div className="bg-[#1e1e1e] border border-[#30363d] rounded-md p-6">
            <h3 className="text-xl font-bold mb-4 text-green-500">Successfully Joined Waitlist!</h3>
            <p className="text-gray-300 mb-4">
              Thank you for joining the Codeclaim waitlist. We'll notify you when we launch.
            </p>
            <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-4 font-mono text-sm mb-4">
              <div className="text-green-500">
                codeclaim@dev:~/waitlist$ <span className="text-gray-400">./check_status.sh</span>
              </div>
              <div className="mt-2">
                <span className="text-blue-400">Status:</span> <span className="text-green-400">Waitlist Joined</span>
              </div>
              <div>
                <span className="text-blue-400">Wallet:</span> <span className="text-yellow-300">{walletAddress}</span>
              </div>
              <div>
                <span className="text-blue-400">Tasks:</span> <span className="text-green-400">All Complete (3/3)</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              We'll send important updates to your connected social accounts. Make sure to stay active in our community!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
