import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "CodeClaim Waitlist",
  description: "Join the CodeClaim waitlist and earn rewards for your open source contributions",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/code_logo_new.png", type: "image/png" },
    ],
    apple: { url: "/images/code_logo_new.png", type: "image/png" },
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
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" href="/images/code_logo_new.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
