import { FloatingActionButton } from "@/components/layout/floating-action-button";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="laptop:pl-72">
        <TopNavbar />
        <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 sm:px-5 tablet:px-6 laptop:px-8 laptop:pb-10 laptop:pt-6">
          {children}
        </main>
      </div>
      <FloatingActionButton />
      <MobileBottomNav />
    </div>
  );
}
