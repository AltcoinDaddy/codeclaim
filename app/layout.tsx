import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "CodeClaim Waitlist",
  description: "Join the CodeClaim waitlist and earn rewards for your open source contributions",
  icons: {
    icon: "/images/code_logo.png",
    apple: "/images/code_logo.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
