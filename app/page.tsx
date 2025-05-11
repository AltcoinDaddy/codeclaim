"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  registerUserWithTasks,
  recordCompletedTask,
  getReferralStats,
  checkUserExists,
  validateWalletAddress,
} from "./actions"

// Types for task management
type TaskId = "discord" | "telegram" | "twitter"
type TaskStatus = Record<TaskId, boolean>
type TaskTimer = Record<TaskId, number>
type TaskInProgress = Record<TaskId, boolean>

// Types for form errors
type FormErrors = {
  username?: string
  wallet?: string
  general?: string
}

export default function Home() {
  const router = useRouter()

  // Get referrer from URL query params
  const searchParams = useSearchParams()
  const referrer = searchParams.get("ref")

  // State to track task completion
  const [tasks, setTasks] = useState<TaskStatus>({
    discord: false,
    telegram: false,
    twitter: false,
  })

  // State for task timers
  const [timers, setTimers] = useState<TaskTimer>({
    discord: 0,
    telegram: 0,
    twitter: 0,
  })

  // State for task in progress
  const [inProgress, setInProgress] = useState<TaskInProgress>({
    discord: false,
    telegram: false,
    twitter: false,
  })

  // Form state
  const [walletAddress, setWalletAddress] = useState("")
  const [username, setUsername] = useState("")
  const [walletChain, setWalletChain] = useState<string | null>(null)

  // UI state
  const [showReadmePopup, setShowReadmePopup] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [referralCount, setReferralCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [loadedFromStorage, setLoadedFromStorage] = useState(false)
  const [isRefreshingStats, setIsRefreshingStats] = useState(false)

  // Loading states
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isValidatingWallet, setIsValidatingWallet] = useState(false)
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false)

  // Timer ref for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  // Interval ref for refreshing referral stats
  const statsRefreshRef = useRef<NodeJS.Timeout | null>(null)

  // Check if all tasks are completed
  const allTasksCompleted = tasks.discord && tasks.telegram && tasks.twitter

  // Load saved progress from localStorage on initial render
  useEffect(() => {
    const savedTasks = localStorage.getItem("codeclaim_tasks")
    const savedUsername = localStorage.getItem("codeclaim_username")
    const savedWallet = localStorage.getItem("codeclaim_wallet")
    const savedSubmissionStatus = localStorage.getItem("codeclaim_submitted")
    const savedUserId = localStorage.getItem("codeclaim_user_id")

    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks) as TaskStatus
        setTasks(parsedTasks)
      } catch (e) {
        console.error("Error parsing saved tasks:", e)
      }
    }

    if (savedUsername) {
      setUsername(savedUsername)
    }

    if (savedWallet) {
      setWalletAddress(savedWallet)
    }

    if (savedUserId) {
      setUserId(savedUserId)
    }

    // Check if the form was previously submitted
    if (savedSubmissionStatus === "true") {
      setFormSubmitted(true)
      setLoadedFromStorage(true)
    }
  }, [])

  // Save progress to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("codeclaim_tasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    if (username) {
      localStorage.setItem("codeclaim_username", username)
    }
  }, [username])

  useEffect(() => {
    if (walletAddress) {
      localStorage.setItem("codeclaim_wallet", walletAddress)
    }
  }, [walletAddress])

  // Single timer effect for all tasks
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Check if any task is in progress
    const anyTaskInProgress = Object.values(inProgress).some(Boolean)

    if (anyTaskInProgress) {
      timerRef.current = setInterval(() => {
        setTimers((prev) => {
          const newTimers = { ...prev }
          let updatedTasks = false

          // Update timers for all in-progress tasks
          Object.keys(inProgress).forEach((taskId) => {
            const task = taskId as TaskId
            if (inProgress[task] && !tasks[task]) {
              if (newTimers[task] < 30) {
                newTimers[task] += 1
              } else {
                // Mark task as complete when timer reaches 30 seconds
                setTasks((prevTasks) => ({
                  ...prevTasks,
                  [task]: true,
                }))

                // Stop the in-progress state
                setInProgress((prevInProgress) => ({
                  ...prevInProgress,
                  [task]: false,
                }))

                // Record completed task in database if user is registered
                if (userId) {
                  recordCompletedTask(userId, task)
                }

                updatedTasks = true
              }
            }
          })

          return newTimers
        })
      }, 1000)
    }

    // Cleanup interval on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [inProgress, tasks, userId])

  // Check username availability when it changes
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (username.length >= 3) {
        setIsCheckingUsername(true)
        setFormErrors((prev) => ({ ...prev, username: undefined }))

        try {
          const result = await checkUserExists(username)

          if (!result.success) {
            setFormErrors((prev) => ({
              ...prev,
              username: result.error || "Error checking username",
            }))
          } else if (result.exists) {
            setFormErrors((prev) => ({
              ...prev,
              username: "Username already taken",
            }))
          }
        } catch (error) {
          setFormErrors((prev) => ({
            ...prev,
            username: "Error checking username",
          }))
        } finally {
          setIsCheckingUsername(false)
        }
      } else if (username.length > 0) {
        setFormErrors((prev) => ({
          ...prev,
          username: "Username must be at least 3 characters",
        }))
      } else {
        setFormErrors((prev) => ({ ...prev, username: undefined }))
      }
    }

    const debounce = setTimeout(() => {
      if (username) {
        checkUsernameAvailability()
      }
    }, 500)

    return () => clearTimeout(debounce)
  }, [username])

  // Validate wallet address when it changes
  useEffect(() => {
    const validateWallet = async () => {
      if (walletAddress.length > 0) {
        setIsValidatingWallet(true)
        setFormErrors((prev) => ({ ...prev, wallet: undefined }))

        try {
          const result = await validateWalletAddress(walletAddress)

          if (!result.success || !result.valid) {
            setFormErrors((prev) => ({
              ...prev,
              wallet: result.error || "Invalid wallet address",
            }))
            setWalletChain(null)
          } else {
            setWalletChain(result.chain || null)
          }
        } catch (error) {
          setFormErrors((prev) => ({
            ...prev,
            wallet: "Error validating wallet address",
          }))
          setWalletChain(null)
        } finally {
          setIsValidatingWallet(false)
        }
      } else {
        setFormErrors((prev) => ({ ...prev, wallet: undefined }))
        setWalletChain(null)
      }
    }

    const debounce = setTimeout(() => {
      if (walletAddress) {
        validateWallet()
      }
    }, 500)

    return () => clearTimeout(debounce)
  }, [walletAddress])

  // Fetch referral stats if username is set
  useEffect(() => {
    const fetchReferralStats = async () => {
      if (username && !formErrors.username) {
        setIsLoadingReferrals(true)

        try {
          const result = await getReferralStats(username)
          if (result.success) {
            setReferralCount(result.count)
            localStorage.setItem("codeclaim_referral_count", result.count.toString())
          }
        } catch (error) {
          console.error("Error fetching referral stats:", error)
        } finally {
          setIsLoadingReferrals(false)
        }
      }
    }

    if (username && (userId || formSubmitted)) {
      fetchReferralStats()
    }
  }, [username, userId, formErrors.username, formSubmitted])

  // Set up periodic refresh of referral stats after submission
  useEffect(() => {
    if (formSubmitted && username) {
      // Clear any existing refresh interval
      if (statsRefreshRef.current) {
        clearInterval(statsRefreshRef.current)
      }

      // Set up a new refresh interval (every 30 seconds)
      statsRefreshRef.current = setInterval(async () => {
        if (!isRefreshingStats) {
          setIsRefreshingStats(true)
          try {
            const result = await getReferralStats(username)
            if (result.success) {
              setReferralCount(result.count)
              localStorage.setItem("codeclaim_referral_count", result.count.toString())
            }
          } catch (error) {
            console.error("Error refreshing referral stats:", error)
          } finally {
            setIsRefreshingStats(false)
          }
        }
      }, 30000) // Refresh every 30 seconds

      // Initial fetch
      refreshReferralStats()
    }

    return () => {
      if (statsRefreshRef.current) {
        clearInterval(statsRefreshRef.current)
      }
    }
  }, [formSubmitted, username])

  // Function to manually refresh referral stats
  const refreshReferralStats = async () => {
    if (username && !isRefreshingStats) {
      setIsRefreshingStats(true)
      try {
        const result = await getReferralStats(username)
        if (result.success) {
          setReferralCount(result.count)
          localStorage.setItem("codeclaim_referral_count", result.count.toString())
        }
      } catch (error) {
        console.error("Error refreshing referral stats:", error)
      } finally {
        setIsRefreshingStats(false)
      }
    }
  }

  // Start task timer
  const startTaskTimer = useCallback(
    (task: TaskId) => {
      if (!tasks[task] && !inProgress[task]) {
        setInProgress((prev) => ({
          ...prev,
          [task]: true,
        }))

        // Reset the timer for this task
        setTimers((prev) => ({
          ...prev,
          [task]: 0,
        }))
      }
    },
    [tasks, inProgress],
  )

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    // Validate form
    let hasErrors = false
    const newErrors: FormErrors = {}

    if (!username) {
      newErrors.username = "Username is required"
      hasErrors = true
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
      hasErrors = true
    }

    if (!walletAddress) {
      newErrors.wallet = "Wallet address is required"
      hasErrors = true
    } else if (!walletChain) {
      newErrors.wallet = "Invalid wallet address format"
      hasErrors = true
    }

    if (!allTasksCompleted) {
      newErrors.general = "Please complete all tasks before submitting"
      hasErrors = true
    }

    if (hasErrors) {
      setFormErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setFormErrors({})

    try {
      // Register user with all tasks in a single operation
      const result = await registerUserWithTasks(username, walletAddress, tasks, referrer || undefined)

      if (result.success && result.userId) {
        setUserId(result.userId)
        localStorage.setItem("codeclaim_user_id", result.userId)

        // Get updated referral stats
        const referralStats = await getReferralStats(username)
        if (referralStats.success) {
          setReferralCount(referralStats.count)
          localStorage.setItem("codeclaim_referral_count", referralStats.count.toString())
        }

        // Save submission status to localStorage
        localStorage.setItem("codeclaim_submitted", "true")

        // Don't clear these values anymore so they can be displayed on the success screen
        // Instead of removing, just keep them for display purposes
        localStorage.setItem("codeclaim_username", username)
        localStorage.setItem("codeclaim_wallet", walletAddress)

        // If there was a referrer, store it
        if (referrer) {
          localStorage.setItem("codeclaim_referrer", referrer)
        }

        setFormSubmitted(true)

        // Update URL to include username as a query param to help with tracking
        // This doesn't cause a page reload but helps with analytics
        if (username) {
          const url = new URL(window.location.href)
          url.searchParams.set("user", username)
          window.history.replaceState({}, "", url.toString())
        }
      } else {
        setFormErrors({
          general: result.error || "Failed to register. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setFormErrors({
        general: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Copy referral link to clipboard
  const copyReferralLink = useCallback(() => {
    // Remove the username requirement check
    const referralLink = `${window.location.origin}${window.location.pathname}${username ? `?ref=${username}` : ""}`

    try {
      navigator.clipboard.writeText(referralLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = referralLink
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand("copy")
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
      } catch (err) {
        console.error("Fallback copy failed:", err)
        setFormErrors((prev) => ({
          ...prev,
          general: "Failed to copy referral link. Please try again.",
        }))
      }

      document.body.removeChild(textArea)
    }
  }, [username])

  const resetForm = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem("codeclaim_tasks")
    localStorage.removeItem("codeclaim_username")
    localStorage.removeItem("codeclaim_wallet")
    localStorage.removeItem("codeclaim_submitted")
    localStorage.removeItem("codeclaim_referral_count")
    localStorage.removeItem("codeclaim_user_id")

    // Reset state
    setFormSubmitted(false)
    setTasks({
      discord: false,
      telegram: false,
      twitter: false,
    })
    setUsername("")
    setWalletAddress("")
    setUserId(null)

    // Force page reload to reset everything
    window.location.reload()
  }, [])

  // Persist referral count in localStorage
  useEffect(() => {
    if (referralCount > 0) {
      localStorage.setItem("codeclaim_referral_count", referralCount.toString())
    }
  }, [referralCount])

  // Load referral count from localStorage on initial render
  useEffect(() => {
    const savedReferralCount = localStorage.getItem("codeclaim_referral_count")
    if (savedReferralCount) {
      setReferralCount(Number.parseInt(savedReferralCount, 10))
    }
  }, [])

  // Check for referrer and update localStorage if needed
  useEffect(() => {
    if (referrer) {
      // Store the referrer in localStorage to persist across sessions
      localStorage.setItem("codeclaim_referrer", referrer)

      // If this is a new visit with a referrer, increment a local count
      const visitedReferrers = JSON.parse(localStorage.getItem("codeclaim_visited_referrers") || "[]")
      if (!visitedReferrers.includes(referrer)) {
        visitedReferrers.push(referrer)
        localStorage.setItem("codeclaim_visited_referrers", JSON.stringify(visitedReferrers))
      }
    }
  }, [referrer])

  return (
    <div className="terminal">
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="window-controls">
              <div className="window-control window-control-red"></div>
              <div className="window-control window-control-yellow"></div>
              <div className="window-control window-control-green"></div>
            </div>
            <div>codeclaim@dev:~$ ./start_dashboard.sh</div>
          </div>
          <a
            href="https://www.codeclaim.club/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 text-sm border border-[#30363d] rounded cursor-pointer hover:bg-[#161b22]"
          >
            Retune Home
          </a>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        <div
          className="tab active"
          onClick={() => setShowReadmePopup(true)}
          role="button"
          tabIndex={0}
          aria-label="Open README file"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setShowReadmePopup(true)
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <span className="tab-icon" style={{ color: "#539bf5" }}>
            📑
          </span>
          <span className="tab-text readme-link">README.md</span>
        </div>
        <div className="tab">
          <span className="tab-icon" style={{ color: "#f0883e" }}>
            💰
          </span>
          <span className="tab-text">earn.token</span>
        </div>
        <div
          className="tab"
          onClick={copyReferralLink}
          style={{ cursor: "pointer", position: "relative" }}
          role="button"
          tabIndex={0}
          aria-label="Copy referral link"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              copyReferralLink()
            }
          }}
        >
          <span className="tab-icon" style={{ color: "#7ee787" }}>
            🔗
          </span>
          <span className="tab-text">referrals.js</span>
          {linkCopied && <div className="copied-tooltip">Referral link copied!</div>}
        </div>
      </div>

      {/* Main Container */}
      <div className="main-container">
        {/* Explorer */}
        <div className="explorer">
          <div className="explorer-header">EXPLORER</div>
          <div className="explorer-item">
            <span className="explorer-icon" style={{ color: "#e34c26" }}>
              📂
            </span>
            <span className="explorer-text">reward</span>
          </div>
          <div className="explorer-item explorer-item-child">
            <span className="explorer-icon" style={{ color: "#f1e05a" }}>
              📄
            </span>
            <span className="explorer-text explorer-text-active">refer.earn</span>
          </div>
          <div className="explorer-item explorer-item-child">
            <span className="explorer-icon" style={{ color: "#f1e05a" }}>
              📄
            </span>
            <span className="explorer-text">earn.token</span>
          </div>
          <div
            className="explorer-item explorer-item-child"
            onClick={copyReferralLink}
            role="button"
            tabIndex={0}
            aria-label="Copy referral link"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                copyReferralLink()
              }
            }}
          >
            <span className="explorer-icon" style={{ color: "#f1e05a" }}>
              📄
            </span>
            <span className="explorer-text">referrals.js</span>
            {linkCopied && <span className="copied-indicator">(copied!)</span>}
          </div>
          <div className="explorer-item">
            <span className="explorer-icon" style={{ color: "#8b949e" }}>
              📄
            </span>
            <span className="explorer-text">config.json</span>
          </div>
          <div
            className="explorer-item"
            onClick={() => setShowReadmePopup(true)}
            role="button"
            tabIndex={0}
            aria-label="Open README file"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setShowReadmePopup(true)
              }
            }}
          >
            <span className="explorer-icon" style={{ color: "#8b949e" }}>
              📄
            </span>
            <span className="explorer-text explorer-text-link">README.md</span>
          </div>
        </div>

        {/* Code Container */}
        <div className="code-container">
          {formSubmitted ? (
            <div className="success-container">
              <h2 className="success-title">Successfully Joined Waitlist!</h2>

              <div className="success-details">
                <div className="success-detail-item">
                  <span className="success-detail-label">Username:</span> {username}
                </div>
                <div className="success-detail-item">
                  <span className="success-detail-label">Wallet:</span> {walletAddress}
                </div>
                <div className="success-detail-item">
                  <span className="success-detail-label">Tasks:</span> All Complete (3/3)
                </div>
                {referrer && (
                  <div className="success-detail-item">
                    <span className="success-detail-label">Referred by:</span> {referrer}
                  </div>
                )}
              </div>

              <div className="referral-stats-container">
                <h3 className="referral-stats-title">
                  Your Referral Stats
                  <button
                    onClick={refreshReferralStats}
                    className="ml-2 text-xs text-blue-400 hover:text-blue-300"
                    disabled={isRefreshingStats}
                    title="Refresh referral stats"
                  >
                    {isRefreshingStats ? "Refreshing..." : "↻ Refresh"}
                  </button>
                </h3>
                <div className="referral-stats-box">
                  <div className="referral-stats-content">
                    <div>
                      <div className="referral-stats-label">Total Referrals</div>
                      <div className="referral-stats-value">{referralCount}</div>
                    </div>
                    <div>
                      <button
                        onClick={copyReferralLink}
                        className="referral-copy-button"
                        aria-label="Copy referral link"
                      >
                        Copy Referral Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <p className="success-message">
                Thank you for joining the Codeclaim waitlist. We'll notify you when we launch!
              </p>
              {/* Hidden reset button for testing - can be removed in production */}
              <button
                onClick={resetForm}
                className="mt-4 text-xs text-gray-600 hover:text-gray-400 opacity-50"
                style={{ fontSize: "10px" }}
              >
                Reset Form (Testing Only)
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="task-interface" aria-label="Waitlist registration form">
              <h2 className="task-title">Complete These Tasks</h2>

              {formErrors.general && (
                <div className="form-error-message" role="alert">
                  {formErrors.general}
                </div>
              )}

              {referrer && (
                <div className="referrer-box">
                  <p className="referrer-text">
                    <span className="referrer-check">✓</span> You were referred by:{" "}
                    <span className="referrer-name">{referrer}</span>
                  </p>
                </div>
              )}

              {/* Discord Task */}
              <div className="task-item">
                <div className="task-item-content">
                  <input
                    type="checkbox"
                    id="task1"
                    checked={tasks.discord}
                    readOnly
                    className="task-checkbox"
                    aria-label="Discord task"
                  />
                  <div className="task-details">
                    <label htmlFor="task1" className="task-label">
                      <span className={`task-number ${tasks.discord ? "task-completed" : ""}`}>
                        {tasks.discord ? "✓" : "1."}
                      </span>
                      Join Codeclaim on Discord
                    </label>

                    {!tasks.discord && !inProgress.discord ? (
                      <a
                        href="https://discord.gg/XUTXTEPr9b"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => startTaskTimer("discord")}
                        className="task-button"
                        aria-label="Join Discord"
                      >
                        Click to Join Discord
                      </a>
                    ) : inProgress.discord ? (
                      <div className="task-progress">
                        <div className="task-progress-text">Verifying your task completion...</div>
                      </div>
                    ) : (
                      <div className="task-completed-message">Discord task completed!</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Telegram Task */}
              <div className="task-item">
                <div className="task-item-content">
                  <input
                    type="checkbox"
                    id="task2"
                    checked={tasks.telegram}
                    readOnly
                    className="task-checkbox"
                    aria-label="Telegram task"
                  />
                  <div className="task-details">
                    <label htmlFor="task2" className="task-label">
                      <span className={`task-number ${tasks.telegram ? "task-completed" : ""}`}>
                        {tasks.telegram ? "✓" : "2."}
                      </span>
                      Join Codeclaim on Telegram
                    </label>

                    {!tasks.telegram && !inProgress.telegram ? (
                      <a
                        href="https://t.me/codeclaims"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => startTaskTimer("telegram")}
                        className="task-button"
                        aria-label="Join Telegram"
                      >
                        Click to Join Telegram
                      </a>
                    ) : inProgress.telegram ? (
                      <div className="task-progress">
                        <div className="task-progress-text">Verifying your task completion...</div>
                      </div>
                    ) : (
                      <div className="task-completed-message">Telegram task completed!</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Twitter/X Task */}
              <div className="task-item">
                <div className="task-item-content">
                  <input
                    type="checkbox"
                    id="task3"
                    checked={tasks.twitter}
                    readOnly
                    className="task-checkbox"
                    aria-label="Twitter/X task"
                  />
                  <div className="task-details">
                    <label htmlFor="task3" className="task-label">
                      <span className={`task-number ${tasks.twitter ? "task-completed" : ""}`}>
                        {tasks.twitter ? "✓" : "3."}
                      </span>
                      Follow Codeclaim on X
                    </label>

                    {!tasks.twitter && !inProgress.twitter ? (
                      <a
                        href="https://x.com/code_claim?s=21"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => startTaskTimer("twitter")}
                        className="task-button"
                        aria-label="Follow on X/Twitter"
                      >
                        Click to Follow on X
                      </a>
                    ) : inProgress.twitter ? (
                      <div className="task-progress">
                        <div className="task-progress-text">Verifying your task completion...</div>
                      </div>
                    ) : (
                      <div className="task-completed-message">X/Twitter task completed!</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="referral-section">
                <div className="referral-header">
                  <span className="referral-icon">↗</span>
                  <span className="referral-title">Share your referral link</span>
                  <span className="referral-hint">(click referrals.js to copy)</span>
                </div>

                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    Enter your preferred username:
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="username"
                      placeholder="e.g., crypto_enthusiast"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`form-input ${formErrors.username ? "input-error" : ""}`}
                      aria-invalid={!!formErrors.username}
                      aria-describedby={formErrors.username ? "username-error" : undefined}
                    />
                    {isCheckingUsername && <span className="input-loading">Checking...</span>}
                  </div>
                  {formErrors.username && (
                    <div id="username-error" className="input-error-message" role="alert">
                      {formErrors.username}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Your referral link:</label>
                  <div className="referral-link-container">
                    <span className="referral-link-text">
                      {window.location.origin}
                      {window.location.pathname}
                      {username ? `?ref=${username}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={copyReferralLink}
                      className="referral-copy-icon"
                      aria-label="Copy referral link"
                    >
                      📋
                    </button>
                  </div>
                  <p className="referral-description">
                    Share this link with friends to earn rewards when they join!
                    {!username && (
                      <span className="text-amber-500">
                        {" "}
                        Add a username to personalize your referral link (optional).
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Wallet Address Input */}
              <div className="wallet-section">
                <div className="wallet-header">
                  <span className={`wallet-icon ${allTasksCompleted ? "wallet-ready" : ""}`}>💼</span>
                  <span className={`wallet-title ${allTasksCompleted ? "wallet-ready" : ""}`}>
                    Submit Your Wallet Address
                  </span>
                </div>

                <div className="form-group">
                  <label
                    htmlFor="wallet"
                    className={`form-label ${allTasksCompleted ? "label-enabled" : "label-disabled"}`}
                  >
                    Enter your wallet address:
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="wallet"
                      placeholder="0x..."
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      disabled={!allTasksCompleted}
                      className={`form-input ${!allTasksCompleted ? "input-disabled" : ""} ${formErrors.wallet ? "input-error" : ""}`}
                      aria-invalid={!!formErrors.wallet}
                      aria-describedby={formErrors.wallet ? "wallet-error" : undefined}
                    />
                    {isValidatingWallet && <span className="input-loading">Validating...</span>}
                    {walletChain && !formErrors.wallet && (
                      <span className="wallet-chain">
                        {walletChain === "ethereum" ? "ETH" : walletChain === "solana" ? "SOL" : walletChain}
                      </span>
                    )}
                  </div>
                  {!allTasksCompleted && (
                    <p className="wallet-disabled-message">Complete all tasks above to submit your wallet address</p>
                  )}
                  {formErrors.wallet && (
                    <div id="wallet-error" className="input-error-message" role="alert">
                      {formErrors.wallet}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  !allTasksCompleted ||
                  !walletAddress ||
                  !username ||
                  !!formErrors.username ||
                  !!formErrors.wallet ||
                  isSubmitting ||
                  isCheckingUsername ||
                  isValidatingWallet
                }
                className="submit-button"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* README.md Popup */}
      {showReadmePopup && (
        <div className="popup-overlay" role="dialog" aria-modal="true" aria-labelledby="readme-title">
          <div className="popup-content">
            <h2 id="readme-title" className="popup-title">
              User Engagement Reward Program
            </h2>

            <p className="popup-text">
              We're launching a reward program to recognize active GitHub and Telegram users based on key activity
              metrics.
            </p>

            <h3 className="popup-subtitle">GitHub Rewards</h3>
            <p className="popup-text">
              GitHub Rewards are based on account age, number of public repositories, commit/push/pull activity, and
              overall contribution history.
            </p>

            <h3 className="popup-subtitle">Telegram Rewards</h3>
            <p className="popup-text">
              Telegram Rewards are based on account age, the number of communities managed or moderated, engagement
              within those communities, and user interaction levels.
            </p>

            <p className="popup-text">
              Additional factors like consistency, influence, and contribution quality may also be considered to ensure
              fair and meaningful rewards.
            </p>

            <div className="popup-actions">
              <button onClick={() => setShowReadmePopup(false)} className="popup-close-button" aria-label="Close popup">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .readme-link {
          color: #539bf5;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
