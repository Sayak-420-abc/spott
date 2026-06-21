"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useStoreUser } from '@/hooks/use-store-user';
import { Building, Crown, Plus, Ticket, Sparkles, TrendingUp, Sun, Moon, Zap, Bell } from 'lucide-react';
import NotificationDropdown from './notification-dropdown';
import { OnboardingModal } from './onboarding-modal';
import { useOnboarding } from '@/hooks/use-onboarding';
import dynamic from "next/dynamic";
import { Badge } from './ui/badge';
import UpgradeModal from './upgrade-modal';
import { useTheme as useNextTheme } from 'next-themes';

const SearchLocationBar = dynamic(() => import("./search-location-bar"), {
  ssr: false,
});

const Header = () => {
  const { isLoading } = useStoreUser();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } =
    useOnboarding();

  const { has } = useAuth();
  const hasPro = has?.({ plan: "pro" });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <>
      <nav 
        style={{
          background: "var(--bg-card)",
          borderBottom: "3px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
        className="w-full"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Logo brand using Outfit ExtraBold and brand purple */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-[var(--color-accent)] border-2 border-[var(--border)] flex items-center justify-center shadow-[2px_2px_0px_0px_var(--shadow-color)]">
              <Zap size={14} className="text-[var(--border)]" strokeWidth={2.5} />
            </div>
            <span
              className="font-[var(--font-display)] font-black text-xl tracking-tight flex items-center"
              style={{ color: "var(--text-primary)" }}
            >
              Spott<span style={{ color: "var(--color-primary)" }}>*</span>
              {hasPro && (
                <span className="ml-2 text-[10px] font-black tracking-widest bg-[var(--color-secondary)] text-white px-2 py-0.5 border border-[var(--border)] shadow-[1px_1px_0px_0px_var(--shadow-color)] uppercase">
                  Pro
                </span>
              )}
            </span>
          </Link>

          {/* Search bar inside the navbar */}
          <div className="hidden md:flex flex-1 justify-center max-w-md">
            <SearchLocationBar />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Theme toggler pill button */}
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                aria-label="Toggle light and dark mode theme"
                className="animate-wiggle"
                style={{
                  background: "var(--bg-card)",
                  border: "2px solid var(--border)",
                  borderRadius: "0px",
                  width: "68px",
                  height: "36px",
                  cursor: "pointer",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 3px",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: "2px 2px 0px 0px var(--shadow-color)",
                }}
              >
                {/* Sliding switch bubble */}
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "0px",
                    background: resolvedTheme === "light" ? "var(--color-accent)" : "var(--color-primary)",
                    border: "2px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transform: resolvedTheme === "light" ? "translateX(0)" : "translateX(32px)",
                  }}
                >
                  {resolvedTheme === "light" ? (
                    <Sun size={12} color="var(--border)" strokeWidth={2.5} />
                  ) : (
                    <Moon size={12} color="#FFFDF5" strokeWidth={2.5} />
                  )}
                </div>
              </button>
            )}

            {!hasPro && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="font-bold text-xs uppercase px-3 py-2 border-2 border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-card)] transition-all cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Pricing
              </button>
            )}

            <Link
              href="/explore"
              className="font-bold text-xs uppercase px-4 py-2 border-2 border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--color-accent)] transition-all shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-y-[-1px] active:translate-y-[1px] text-[var(--text-primary)] hidden sm:inline-block"
            >
              Explore
            </Link>

            <SignedIn>
              <Link
                href="/create-event"
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_var(--shadow-color)] h-9"
                style={{ textDecoration: "none" }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Create</span>
              </Link>

              {/* Notification Bell */}
              <NotificationDropdown />

              {/* User Avatar in thick-bordered circle */}
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 2,
                  border: "2px solid var(--border)",
                  background: "var(--bg-card)",
                  borderRadius: "50%",
                  boxShadow: "2px 2px 0px 0px var(--shadow-color)"
                }}
                className="w-9 h-9"
              >
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="My tickets"
                      labelIcon={<Ticket size={16} />}
                      href="/my-tickets"
                    />
                    <UserButton.Link
                      label="My Events"
                      labelIcon={<Building size={16} />}
                      href="/my-events"
                    />
                    <UserButton.Link
                      label="Analytics"
                      labelIcon={<TrendingUp size={16} />}
                      href="/analytics"
                    />
                    <UserButton.Action label="manageAccount" />
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-secondary text-xs px-4 py-2 shadow-[2px_2px_0px_0px_var(--shadow-color)] h-9 cursor-pointer">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden border-t-2 border-[var(--border)] px-4 py-3 bg-[var(--bg-card)]">
          <SearchLocationBar />
        </div>

        {isLoading && (
          <div className="h-1 bg-[var(--color-primary)] w-full animate-pulse" />
        )}
      </nav>

      {/* Modals */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingSkip}
        onComplete={handleOnboardingComplete}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="header"
      />
    </>
  );
};

export default Header;
