import Header from "@/components/header";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
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
              variables: {
                colorPrimary: "#6C47FF",
                colorBackground: "#FAF3E0",
                colorInputBackground: "#FAF3E0",
                colorInputText: "#1E293B",
                colorText: "#1E293B",
                colorTextSecondary: "#475569",
                colorNeutral: "#1E293B",
                colorDanger: "#DC2626",
                colorSuccess: "#16A34A",
                borderRadius: "0px",
                fontFamily: "'Outfit', sans-serif",
                fontSize: "14px",
                fontWeight: { normal: 500, medium: 600, bold: 800 },
                spacingUnit: "16px",
              },
              elements: {
                card: {
                  border: "3px solid #1E293B",
                  boxShadow: "8px 8px 0px 0px #1E293B",
                  borderRadius: "0px",
                  background: "#FAF3E0",
                },
                rootBox: {
                  borderRadius: "0px",
                },
                modalBackdrop: {
                  backdropFilter: "blur(4px)",
                  background: "rgba(30, 41, 59, 0.65)",
                },
                modalContent: {
                  borderRadius: "0px",
                },
                headerTitle: {
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "#1E293B",
                },
                headerSubtitle: {
                  color: "#475569",
                  fontFamily: "'Outfit', sans-serif",
                },
                formButtonPrimary: {
                  background: "#6C47FF",
                  border: "2px solid #1E293B",
                  boxShadow: "3px 3px 0px 0px #1E293B",
                  borderRadius: "0px",
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translate(-1px,-1px)",
                    boxShadow: "4px 4px 0px 0px #1E293B",
                  },
                },
                formButtonReset: {
                  border: "2px solid #1E293B",
                  borderRadius: "0px",
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                },
                formFieldInput: {
                  border: "2px solid #1E293B",
                  borderRadius: "0px",
                  background: "#FFFDF9",
                  boxShadow: "2px 2px 0px 0px #1E293B",
                  fontFamily: "'Outfit', sans-serif",
                  color: "#1E293B",
                  "&:focus": {
                    borderColor: "#6C47FF",
                    boxShadow: "2px 2px 0px 0px #6C47FF",
                  },
                },
                formFieldLabel: {
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#1E293B",
                },
                socialButtonsBlockButton: {
                  border: "2px solid #1E293B",
                  borderRadius: "0px",
                  boxShadow: "2px 2px 0px 0px #1E293B",
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  background: "#FFFDF9",
                  "&:hover": {
                    background: "#F5CB5C",
                    transform: "translate(-1px,-1px)",
                    boxShadow: "3px 3px 0px 0px #1E293B",
                  },
                },
                dividerLine: { background: "#1E293B" },
                dividerText: {
                  color: "#475569",
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "0.65rem",
                },
                footerActionLink: {
                  color: "#6C47FF",
                  fontWeight: 700,
                  fontFamily: "'Outfit', sans-serif",
                  textDecoration: "underline",
                },
                badge: {
                  borderRadius: "0px",
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                },
                userPreviewMainIdentifier: {
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  color: "#1E293B",
                },
                userPreviewSecondaryIdentifier: {
                  color: "#475569",
                  fontFamily: "'Outfit', sans-serif",
                },
                menuItem: {
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                  borderRadius: "0px",
                  color: "#1E293B",
                },
                menuItemIcon: {
                  color: "#6C47FF",
                },
                userButtonPopoverCard: {
                  border: "3px solid #1E293B",
                  boxShadow: "6px 6px 0px 0px #1E293B",
                  borderRadius: "0px",
                  background: "#FAF3E0",
                },
                userButtonPopoverActionButton: {
                  borderRadius: "0px",
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                  color: "#1E293B",
                  "&:hover": { background: "#F5CB5C" },
                },
                userButtonPopoverActionButtonIcon: {
                  color: "#6C47FF",
                },
                avatarBox: {
                  border: "2px solid #1E293B",
                  boxShadow: "2px 2px 0px 0px #1E293B",
                  borderRadius: "50%",
                },
                pricingTable: {
                  background: "#FAF3E0",
                  border: "2px solid #1E293B",
                  borderRadius: "0px",
                  boxShadow: "4px 4px 0px 0px #1E293B",
                },
              },
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
