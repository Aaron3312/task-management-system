'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/MockAuthContext';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import { gsap } from 'gsap';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, userRole } = useAuth();

  // Refs for animations
  const headerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Derive username from user data
  const username = currentUser?.username || currentUser?.full_name || 'Demo User';

  useEffect(() => {
    // Initial page load animations
    const tl = gsap.timeline();

    // Animate header sliding down with bounce
    tl.fromTo(headerRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
    );

    // Animate sidebar sliding in from left with elastic ease
    tl.fromTo(sidebarRef.current,
      { x: -280, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: "elastic.out(1, 0.3)" },
      "-=0.5"
    );

    // Animate main content with staggered fade-in
    tl.fromTo(mainContentRef.current,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power2.out" },
      "-=0.6"
    );
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);

    // Enhanced mobile sidebar animation
    if (!sidebarOpen) {
      gsap.fromTo('.sheet-content',
        { x: -280, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Mobile sidebar with enhanced animations */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 sheet-content">
          <Sidebar userRole={userRole} />
        </SheetContent>
      </Sheet>

      {/* App Header with hover effects */}
      <div
        ref={headerRef}
        className="transition-all duration-300 hover:shadow-lg"
      >
        <AppHeader
          username={username}
          userRole={userRole}
          onToggleSidebar={toggleSidebar}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar with hover effects */}
        <div
          ref={sidebarRef}
          className="hidden md:block w-64 flex-shrink-0 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
        >
          <Sidebar userRole={userRole} className="h-full" />
        </div>

        {/* Main content with subtle hover effects */}
        <div className="flex-1 overflow-auto relative">
          {/* Subtle animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 dark:from-blue-950/10 dark:to-purple-950/10 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

          <main
            ref={mainContentRef}
            className="py-6 px-4 sm:px-6 lg:px-8 relative z-10"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}