import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "AgentDesk — AI Agent Orchestration for Enterprise Teams",
    template: "%s | AgentDesk",
  },
  description:
    "Zero-touch AI agent orchestration. Deploy, monitor, and scale AI agents with full observability, team collaboration, and Stripe billing.",
  keywords: ["AI agents", "orchestration", "enterprise", "automation", "OpenAI"],
  authors: [{ name: "Aurora Rayes LLC" }],
  openGraph: {
    title: "AgentDesk",
    description: "Zero-touch AI agent orchestration for enterprise teams",
    url: "https://agentdesk.app",
    siteName: "AgentDesk",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentDesk",
    description: "Zero-touch AI agent orchestration for enterprise teams",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}