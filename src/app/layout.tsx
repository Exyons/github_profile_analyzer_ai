import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GitHub Portfolio Analyzer | AI-Powered Profile Enhancement",
  description:
    "Analyze any GitHub profile with AI. Get a Hiring Score, bio suggestions, README critiques, and actionable improvements powered by a secured Ollama instance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="gradient-mesh" />
        <Header />
        <main className="min-h-[calc(100vh-130px)]">{children}</main>
        <footer className="border-t border-white/5 py-6 text-center text-sm text-gray-500">
          <p>
            Built with Next.js, Tailwind CSS & AI •{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors hover:text-white"
            >
              GitHub
            </a>
          </p>
        </footer>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(17, 17, 27, 0.95)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e5e5e5",
            },
          }}
        />
      </body>
    </html>
  );
}

