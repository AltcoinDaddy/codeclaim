"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle2 } from "lucide-react"

interface CodeBlockProps {
  className?: string
  language?: string
  code: string
  fileName?: string
}

export function CodeBlock({ className, language = "javascript", code, fileName }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("code-block relative group", className)}>
      {fileName && (
        <div className="bg-[#0d1117] border-b border-[#30363d] px-4 py-2 font-mono text-xs text-gray-400">
          {fileName}
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <pre className={`language-${language}`}>
        <code>{code}</code>
      </pre>
    </div>
  )
}
