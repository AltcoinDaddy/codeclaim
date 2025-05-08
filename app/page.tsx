"use client"

import type React from "react"

import { useState } from "react"

export default function Home() {
  // State to track task completion
  const [tasks, setTasks] = useState({
    discord: false,
    telegram: false,
    twitter: false,
  })

  const [walletAddress, setWalletAddress] = useState("")
  const [username, setUsername] = useState("")

  // Check if all tasks are completed
  const allTasksCompleted = tasks.discord && tasks.telegram && tasks.twitter

  // Handle task checkbox change
  const handleTaskChange = (task: "discord" | "telegram" | "twitter") => {
    setTasks((prev) => ({
      ...prev,
      [task]: !prev[task],
    }))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (allTasksCompleted && walletAddress) {
      console.log("Form submitted:", { tasks, walletAddress, username })
      // Here you would typically send this data to your backend
    }
  }

  return (
    <div className="terminal">
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="window-controls">
          <div className="window-control window-control-red"></div>
          <div className="window-control window-control-yellow"></div>
          <div className="window-control window-control-green"></div>
        </div>
        <div>codeclaim@dev:~$ ./start_dashboard.sh</div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        <div className="tab active">
          <span style={{ color: "#539bf5", marginRight: "8px" }}>📄</span>
          <span style={{ color: "#e6edf3" }}>dashboard.js</span>
        </div>
        <div className="tab">
          <span style={{ color: "#f0883e", marginRight: "8px" }}>💰</span>
          <span>earn.js</span>
        </div>
        <div className="tab">
          <span style={{ color: "#7ee787", marginRight: "8px" }}>🔗</span>
          <span>referrals.js</span>
        </div>
        <div className="tab">
          <span style={{ color: "#d2a8ff", marginRight: "8px" }}>🪙</span>
          <span>token.js</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="main-container">
        {/* Explorer */}
        <div className="explorer">
          <div className="explorer-header">EXPLORER</div>
          <div className="explorer-item">
            <span style={{ color: "#e34c26", marginRight: "8px" }}>📂</span>
            <span style={{ color: "#e6edf3" }}>main</span>
          </div>
          <div className="explorer-item" style={{ paddingLeft: "32px" }}>
            <span style={{ color: "#f1e05a", marginRight: "8px" }}>📄</span>
            <span style={{ color: "#f1e05a" }}>dashboard.js</span>
          </div>
          <div className="explorer-item" style={{ paddingLeft: "32px" }}>
            <span style={{ color: "#f1e05a", marginRight: "8px" }}>📄</span>
            <span>earn.js</span>
          </div>
          <div className="explorer-item" style={{ paddingLeft: "32px" }}>
            <span style={{ color: "#f1e05a", marginRight: "8px" }}>📄</span>
            <span>referrals.js</span>
          </div>
          <div className="explorer-item" style={{ paddingLeft: "32px" }}>
            <span style={{ color: "#f1e05a", marginRight: "8px" }}>📄</span>
            <span>token.js</span>
          </div>
          <div className="explorer-item">
            <span style={{ color: "#8b949e", marginRight: "8px" }}>📄</span>
            <span>config.json</span>
          </div>
          <div className="explorer-item">
            <span style={{ color: "#8b949e", marginRight: "8px" }}>📄</span>
            <span>README.md</span>
          </div>
        </div>

        {/* Code Container */}
        <div className="code-container">
          <div className="terminal-prompt">
            codeclaim@dev:~/dashboard$ <span>cat tasks.js</span>
          </div>
          <form
            onSubmit={handleSubmit}
            className="task-interface"
            style={{
              backgroundColor: "#0d1117",
              color: "#e6edf3",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#e6edf3" }}>Complete These Tasks</h2>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}>
                <input
                  type="checkbox"
                  id="task1"
                  checked={tasks.discord}
                  onChange={() => handleTaskChange("discord")}
                  style={{ marginRight: "10px", marginTop: "4px" }}
                />
                <div>
                  <label htmlFor="task1" style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ color: "#7ee787", marginRight: "8px" }}>✓</span> Join Codeclaim on Discord
                  </label>
                  <a href="#" style={{ color: "#539bf5", fontSize: "14px", textDecoration: "none" }}>
                    Click here to join Discord
                  </a>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}>
                <input
                  type="checkbox"
                  id="task2"
                  checked={tasks.telegram}
                  onChange={() => handleTaskChange("telegram")}
                  style={{ marginRight: "10px", marginTop: "4px" }}
                />
                <div>
                  <label htmlFor="task2" style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ color: "#7ee787", marginRight: "8px" }}>✓</span> Join Codeclaim on Telegram
                  </label>
                  <a href="#" style={{ color: "#539bf5", fontSize: "14px", textDecoration: "none" }}>
                    Click here to join Telegram
                  </a>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}>
                <input
                  type="checkbox"
                  id="task3"
                  checked={tasks.twitter}
                  onChange={() => handleTaskChange("twitter")}
                  style={{ marginRight: "10px", marginTop: "4px" }}
                />
                <div>
                  <label htmlFor="task3" style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ color: "#7ee787", marginRight: "8px" }}>✓</span> Follow Codeclaim on X
                  </label>
                  <a href="#" style={{ color: "#539bf5", fontSize: "14px", textDecoration: "none" }}>
                    Click here to follow on X
                  </a>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "16px", borderTop: "1px solid #30363d", paddingTop: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ color: "#8b949e", marginRight: "8px" }}>↗</span> Share your referral link (Optional)
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label
                  htmlFor="username"
                  style={{ fontSize: "14px", color: "#8b949e", display: "block", marginBottom: "6px" }}
                >
                  Enter your preferred username:
                </label>
                <input
                  type="text"
                  id="username"
                  placeholder="e.g., crypto_enthusiast"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#e6edf3",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label style={{ fontSize: "14px", color: "#8b949e", display: "block", marginBottom: "6px" }}>
                  Your referral link:
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  <span style={{ flex: 1, color: "#e6edf3", overflow: "hidden", textOverflow: "ellipsis" }}>
                    https://codeclaim.vercel.app/waitlist{username ? `?ref=${username}` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://codeclaim.vercel.app/waitlist${username ? `?ref=${username}` : ""}`,
                      )
                    }}
                    style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer" }}
                  >
                    📋
                  </button>
                </div>
              </div>

              <p style={{ fontSize: "12px", color: "#8b949e" }}>
                Share this link with friends to earn rewards when they join!
              </p>
            </div>

            {/* Wallet Address Input */}
            <div style={{ marginBottom: "16px", borderTop: "1px solid #30363d", paddingTop: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ color: allTasksCompleted ? "#7ee787" : "#8b949e", marginRight: "8px" }}>💼</span>
                <span style={{ color: allTasksCompleted ? "#e6edf3" : "#8b949e" }}>Submit Your Wallet Address</span>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label
                  htmlFor="wallet"
                  style={{
                    fontSize: "14px",
                    color: allTasksCompleted ? "#e6edf3" : "#8b949e",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Enter your wallet address:
                </label>
                <input
                  type="text"
                  id="wallet"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  disabled={!allTasksCompleted}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#e6edf3",
                    fontSize: "14px",
                    opacity: allTasksCompleted ? 1 : 0.5,
                    cursor: allTasksCompleted ? "text" : "not-allowed",
                  }}
                />
                {!allTasksCompleted && (
                  <p style={{ fontSize: "12px", color: "#f85149", marginTop: "4px" }}>
                    Complete all tasks above to submit your wallet address
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!allTasksCompleted || !walletAddress}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: allTasksCompleted && walletAddress ? "#238636" : "#30363d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: allTasksCompleted && walletAddress ? "pointer" : "not-allowed",
                fontSize: "14px",
                fontWeight: "bold",
                opacity: allTasksCompleted && walletAddress ? 1 : 0.7,
              }}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
