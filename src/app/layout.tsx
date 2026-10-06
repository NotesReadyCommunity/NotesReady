import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | NotesReady",
    default: "NotesReady — The Modern Digital Knowledge Workspace",
  },
  description:
    "NotesReady is a calm, powerful workspace to capture, organize, remember, and collaborate on your notes and knowledge.",
  icons: {
    icon: "/favicon.svg",
    apple: "/brand/icon-dark.svg",
  },
  metadataBase: new URL("https://notesready.in"),
  openGraph: {
    title: "NotesReady — The Modern Digital Knowledge Workspace",
    description:
      "Simple enough to start instantly. Powerful enough to grow with you.",
    url: "https://notesready.in",
    siteName: "NotesReady",
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
