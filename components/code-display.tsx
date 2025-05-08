"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface CodeDisplayProps {
  className?: string
  code: string
  language?: string
  showLineNumbers?: boolean
  prompt?: string
}

export function CodeDisplay({
  className,
  code,
  language = "javascript",
  showLineNumbers = false,
  prompt,
}: CodeDisplayProps) {
  return (
    <div className={cn("bg-[#0d1117] rounded-md", className)}>
      {prompt && (
        <div className="text-green-500 mb-2">
          {prompt} <span className="text-gray-400">cat dashboard.js</span>
        </div>
      )}
      <pre className={cn("text-sm", className)}>
        <code>
          {code.split("\n").map((line, i) => (
            <div key={i} className="leading-6">
              {showLineNumbers && <span className="text-gray-500 mr-4">{i + 1}</span>}
              {formatCodeLine(line, language)}
            </div>
          ))}
        </code>
      </pre>
    </div>
  )
}

function formatCodeLine(line: string, language: string): React.ReactNode {
  if (language !== "javascript") return line

  // Very basic syntax highlighting for JavaScript
  return line
    .replace(
      /^(\s*)(const|let|var|function|return|if|else|for|while)(\s+)/g,
      '$1<span class="syntax-keyword">$2</span>$3',
    )
    .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="syntax-string">$1</span>')
    .replace(/(\w+)(\s*\()/g, '<span class="syntax-function">$1</span>$2')
    .replace(/(\w+):/g, '<span class="syntax-property">$1</span>:')
    .split(/(<span.*?<\/span>)/)
    .map((part, i) => {
      if (part.startsWith("<span")) {
        return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />
      }
      return <span key={i}>{part}</span>
    })
}
