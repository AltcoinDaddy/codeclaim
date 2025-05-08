"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Terminal } from "lucide-react"

interface TerminalHeaderProps {
  className?: string
  prompt?: string
  commands?: string[]
}

export function TerminalHeader({
  className,
  prompt = "codeclaim@dev:~$",
  commands = ["cd waitlist", "npm run start"],
}: TerminalHeaderProps) {
  const [currentCommand, setCurrentCommand] = useState("")
  const [commandIndex, setCommandIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    if (commandIndex >= commands.length) return

    const command = commands[commandIndex]

    if (charIndex < command.length) {
      const timer = setTimeout(() => {
        setCurrentCommand((prev) => prev + command[charIndex])
        setCharIndex((prev) => prev + 1)
      }, 100)

      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setCommandIndex((prev) => prev + 1)
        setCharIndex(0)
        setCurrentCommand("")
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [commandIndex, charIndex, commands])

  return (
    <div className={cn("terminal-header", className)}>
      <Terminal className="h-4 w-4 mr-2 text-green-500" />
      <div className="flex-1 overflow-hidden">
        <span className="terminal-prompt">{prompt} </span>
        <span className="typing-animation">{currentCommand}</span>
      </div>
    </div>
  )
}
