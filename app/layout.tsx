import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, themeScript } from "@/components/layout/ThemeProvider";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Innsats",
  description: "Treningsapp for Mathias og Karoline",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
