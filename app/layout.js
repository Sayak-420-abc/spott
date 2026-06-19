import Header from "@/components/header";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Spott",
  description: "Discover and create amazing events",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dot-grid antialiased text-[var(--text-primary)] min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider 
            appearance={{
              theme: dark
            }}
          >
            <ConvexClientProvider>
              {/*Header*/}
              <Header />
              <main className="relative min-h-screen container mx-auto pt-24 md:pt-28 px-4">
                <div className="relative z-10 min-h-[70vh]">{children}</div>
                {/*Footer */}
                <footer className="border-t-3 border-[var(--border)] py-8 mt-16 max-w-7xl mx-auto text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  <div>
                    Made with ❤️ by sayak
                  </div>
                </footer>
                <Toaster richColors />
              </main>
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
