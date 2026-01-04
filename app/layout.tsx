import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";
import { ThemeProvider } from "../components/providers/theme-provider";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeCat - AI Code Review",
  description:
    "Streamline your workflow with automated AI-powered code reviews. Catch bugs early and improve code quality.",
  keywords: [
    "code review",
    "ai",
    "automated code review",
    "github",
    "pull request",
    "developer tools",
  ],
  openGraph: {
    title: "CodeCat - AI Code Review",
    description:
      "Streamline your workflow with automated AI-powered code reviews.",
    url: "https://codecat.ai", // Placeholder
    siteName: "CodeCat",
    images: [
      {
        url: "/login-hero.png",
        width: 1200,
        height: 630,
        alt: "CodeCat AI Code Review",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeCat - AI Code Review",
    description:
      "Streamline your workflow with automated AI-powered code reviews.",
    images: ["/login-hero.png"],
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${openSans.variable} antialiased font-open-sans `}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <Toaster />
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
