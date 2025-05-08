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
  ArrowRight,
  AlertCircle,
} from "lucide-react"
import { CodeDisplay } from "./code-display"

interface WaitlistFormProps {
  className?: string
  onComplete?: (data: FormData) => void
}

type Step = {
  id: string
  title: string
  description: string
  icon: React.ElementType
  isRequired: boolean
}

export function WaitlistForm({ className, onComplete }: WaitlistFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isConnected, setIsConnected] = useState<Record<string, boolean>>({
    discord: false,
    telegram: false,
    twitter: false,
  })

  const steps: Step[] = [
    {
      id: "discord",
      title: "Connect Discord",
      description: "Link your Discord account to join our community",
      icon: Discord,
      isRequired: true,
    },
    {
      id: "telegram",
      title: "Connect Telegram",
      description: "Link your Telegram for important updates",
      icon: MessageSquare,
      isRequired: true,
    },
    {
      id: "twitter",
      title: "Connect X/Twitter",
      description: "Link your X/Twitter account to spread the word",
      icon: Twitter,
      isRequired: true,
    },
    {
      id: "wallet",
      title: "Submit Wallet Address",
      description: "Add your wallet to receive rewards",
      icon: Wallet,
      isRequired: true,
    },
  ]

  const handleConnect = (platform: string) => {
    // Simulate connection
    setIsConnected((prev) => ({
      ...prev,
      [platform]: true,
    }))

    setFormData((prev) => ({
      ...prev,
      [platform]: `connected_${platform}_${Math.random().toString(36).substring(2, 8)}`,
    }))
  }

  const handleWalletSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formElement = e.target as HTMLFormElement
    const walletAddress = new FormData(formElement).get("wallet") as string

    setFormData((prev) => ({
      ...prev,
      wallet: walletAddress,
    }))

    // Complete the form
    if (onComplete) {
      const finalFormData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        finalFormData.append(key, value)
      })
      finalFormData.append("wallet", walletAddress)
      onComplete(finalFormData)
    }
  }

  const canProceed = () => {
    if (currentStep < 3) {
      return isConnected[steps[currentStep].id]
    }
    return true
  }

  const handleNext = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const currentStepData = steps[currentStep]

  const formCode = `
const joinWaitlist = {
  step: "${currentStepData.id}",
  title: "${currentStepData.title}",
  isRequired: ${currentStepData.isRequired},
  isConnected: ${isConnected[currentStepData.id] || false},
  
  connect: function() {
    // Connect to ${currentStepData.id}
    return this.isConnected = true;
  },
  
  submit: function(data) {
    if (this.validate(data)) {
      return {
        success: true,
        message: "Successfully joined waitlist!"
      };
    }
    return {
      success: false,
      message: "Please complete all required steps."
    };
  },
  
  validate: function(data) {
    return this.isRequired ? this.isConnected : true;
  }
};
`

  return (
    <div className={cn("", className)}>
      <div className="mb-6">
        <CodeDisplay code={formCode} prompt="codeclaim@dev:~/waitlist$" className="mb-6" />

        <div className="flex mb-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn("flex-1 flex flex-col items-center", index < steps.length - 1 && "relative")}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border",
                  currentStep === index
                    ? "bg-blue-500 border-blue-600 text-white"
                    : index < currentStep || isConnected[step.id]
                      ? "bg-green-500 border-green-600 text-white"
                      : "bg-[#1e1e1e] border-[#30363d] text-gray-400",
                )}
              >
                {index < currentStep || isConnected[step.id] ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>

              <span className="text-xs mt-2 text-center hidden sm:block">{step.title}</span>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-4 left-1/2 w-full h-0.5 bg-[#30363d]",
                    (index < currentStep || (isConnected[step.id] && isConnected[steps[index + 1].id])) &&
                      "bg-green-500",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-2">
            <currentStepData.icon className="h-5 w-5 mr-2 text-blue-500" />
            <h3 className="text-lg">{currentStepData.title}</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">{currentStepData.description}</p>

          {currentStep < 3 ? (
            <Button
              variant={isConnected[currentStepData.id] ? "outline" : "default"}
              className="w-full"
              onClick={() => handleConnect(currentStepData.id)}
              disabled={isConnected[currentStepData.id]}
            >
              {isConnected[currentStepData.id] ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Connected
                </>
              ) : (
                <>Connect {currentStepData.title.split(" ")[1]}</>
              )}
            </Button>
          ) : (
            <form onSubmit={handleWalletSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="wallet" className="text-sm">
                  Wallet Address
                </label>
                <Input
                  id="wallet"
                  name="wallet"
                  placeholder="0x..."
                  className="bg-[#1e1e1e] border-[#30363d]"
                  required
                  disabled={!Object.values(isConnected).every(Boolean)}
                />
                {!Object.values(isConnected).every(Boolean) && (
                  <div className="flex items-center text-amber-500 text-xs mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Complete previous steps to enable wallet submission
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button type="submit" disabled={!Object.values(isConnected).every(Boolean)}>
                  Submit
                </Button>
              </div>
            </form>
          )}
        </div>

        {currentStep < 3 && (
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
