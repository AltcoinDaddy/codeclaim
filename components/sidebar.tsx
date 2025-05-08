"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  FileCode2,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Github,
  GitBranch,
  GitPullRequest,
  Star,
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    src: true,
    components: true,
  })

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folder]: !prev[folder],
    }))
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-[#0d1117] border-r border-[#30363d] transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Github className="h-5 w-5 text-white" />
            <span className="font-mono text-sm">codeclaim/waitlist</span>
          </div>
          <div className="flex items-center space-x-2">
            <GitBranch className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-mono text-gray-400">main</span>
          </div>
        </div>

        <div className="p-2 border-b border-[#30363d] flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400">EXPLORER</span>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-8rem)]">
          <div className="p-2">
            <div className="mb-2">
              <button
                className="flex items-center w-full text-left p-1 hover:bg-[#161b22] rounded"
                onClick={() => toggleFolder("src")}
              >
                {expandedFolders["src"] ? (
                  <ChevronDown className="h-4 w-4 mr-1 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1 text-gray-400" />
                )}
                <FolderOpen className="h-4 w-4 mr-1 text-blue-400" />
                <span className="text-sm">src</span>
              </button>

              {expandedFolders["src"] && (
                <div className="ml-4">
                  <button
                    className="flex items-center w-full text-left p-1 hover:bg-[#161b22] rounded"
                    onClick={() => toggleFolder("components")}
                  >
                    {expandedFolders["components"] ? (
                      <ChevronDown className="h-4 w-4 mr-1 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-1 text-gray-400" />
                    )}
                    <FolderOpen className="h-4 w-4 mr-1 text-blue-400" />
                    <span className="text-sm">components</span>
                  </button>

                  {expandedFolders["components"] && (
                    <div className="ml-4">
                      <div className="flex items-center p-1 hover:bg-[#161b22] rounded">
                        <FileCode2 className="h-4 w-4 mr-1 text-orange-400" />
                        <span className="text-sm">WaitlistForm.tsx</span>
                      </div>
                      <div className="flex items-center p-1 hover:bg-[#161b22] rounded">
                        <FileCode2 className="h-4 w-4 mr-1 text-orange-400" />
                        <span className="text-sm">Terminal.tsx</span>
                      </div>
                      <div className="flex items-center p-1 hover:bg-[#161b22] rounded">
                        <FileCode2 className="h-4 w-4 mr-1 text-orange-400" />
                        <span className="text-sm">ReferralSystem.tsx</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center p-1 hover:bg-[#161b22] rounded">
                    <FileCode2 className="h-4 w-4 mr-1 text-purple-400" />
                    <span className="text-sm">index.ts</span>
                  </div>
                  <div className="flex items-center p-1 hover:bg-[#161b22] rounded">
                    <FileCode2 className="h-4 w-4 mr-1 text-blue-400" />
                    <span className="text-sm">types.ts</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-2">
              <div className="flex items-center p-1 hover:bg-[#161b22] rounded">
                <FileCode2 className="h-4 w-4 mr-1 text-green-400" />
                <span className="text-sm">README.md</span>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex items-center p-1 hover:bg-[#161b22] rounded">
                <FileCode2 className="h-4 w-4 mr-1 text-yellow-400" />
                <span className="text-sm">package.json</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 w-full border-t border-[#30363d] p-2 bg-[#0d1117]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GitPullRequest className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-mono text-gray-400">0 PRs</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-mono text-gray-400">Star</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
