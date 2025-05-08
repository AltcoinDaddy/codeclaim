"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { FileJsonIcon, FileText, FolderOpen } from "lucide-react"
import { FileJsonIcon as FileJs } from "lucide-react"

interface TerminalWindowProps {
  children: React.ReactNode
  className?: string
  title?: string
  activeTab?: string
  showExplorer?: boolean
}

export function TerminalWindow({
  children,
  className,
  title = "codeclaim@dev:~$ ./start_waitlist.sh",
  activeTab = "dashboard",
  showExplorer = true,
}: TerminalWindowProps) {
  return (
    <div className={cn("border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117]", className)}>
      {/* Terminal Header with window controls */}
      <div className="bg-[#1e1e1e] p-2 border-b border-[#30363d] flex items-center">
        <div className="window-controls">
          <div className="window-control window-control-red"></div>
          <div className="window-control window-control-yellow"></div>
          <div className="window-control window-control-green"></div>
        </div>
        <div className="text-sm text-gray-400 flex-1">{title}</div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <div className={cn("tab active")}>
          <FileJs className="h-4 w-4 mr-2 text-blue-400" />
          dashboard.js
        </div>
        <div className="tab">
          <FileJs className="h-4 w-4 mr-2 text-yellow-400" />
          earn.js
        </div>
        <div className="tab">
          <FileJs className="h-4 w-4 mr-2 text-green-400" />
          referrals.js
        </div>
        <div className="tab">
          <FileJs className="h-4 w-4 mr-2 text-purple-400" />
          token.js
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Explorer Sidebar */}
        {showExplorer && (
          <div className="w-64 border-r border-[#30363d] p-2 hidden md:block">
            <div className="text-xs text-gray-400 font-bold mb-2 px-2">EXPLORER</div>
            <div>
              <div className="explorer-item">
                <FolderOpen className="h-4 w-4 mr-2 explorer-folder" />
                <span>main</span>
              </div>
              <div className="pl-4">
                <div className="explorer-item font-bold">
                  <FileJs className="h-4 w-4 mr-2 explorer-file-js" />
                  <span>dashboard.js</span>
                </div>
                <div className="explorer-item">
                  <FileJs className="h-4 w-4 mr-2 explorer-file-js" />
                  <span>earn.js</span>
                </div>
                <div className="explorer-item">
                  <FileJs className="h-4 w-4 mr-2 explorer-file-js" />
                  <span>referrals.js</span>
                </div>
                <div className="explorer-item">
                  <FileJs className="h-4 w-4 mr-2 explorer-file-js" />
                  <span>token.js</span>
                </div>
              </div>
              <div className="explorer-item">
                <FileJsonIcon className="h-4 w-4 mr-2 explorer-file-json" />
                <span>config.json</span>
              </div>
              <div className="explorer-item">
                <FileText className="h-4 w-4 mr-2 explorer-file-md" />
                <span>README.md</span>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 p-4">{children}</div>
      </div>
    </div>
  )
}
