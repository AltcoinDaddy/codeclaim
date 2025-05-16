import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "CodeClaim Waitlist",
  description: "Join the CodeClaim waitlist and earn rewards for your open source contributions",
  icons: {
    icon: [
      { url: "https://i.ibb.co/b5grxTXD/code-logo.png", sizes: "any" },
      { url: "https://i.ibb.co/b5grxTXD/code-logo.png", type: "any" },
    ],
    apple: { url: "https://i.ibb.co/b5grxTXD/code-logo.png", type: "any" },
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="https://i.ibb.co/b5grxTXD/code-logo.png" />
        <link rel="icon" href="https://i.ibb.co/b5grxTXD/code-logo.png" type="any" />
      </head>
      <body>{children}</body>
    </html>
  )
}
