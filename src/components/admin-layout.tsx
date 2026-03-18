'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/pairings', label: 'Pairings' },
  { href: '/admin/markets', label: 'Markets' },
  { href: '/admin/bets', label: 'Bets' },
  { href: '/admin/exposure', label: 'Exposure' },
  { href: '/admin/leaderboard', label: 'Leaderboard' },
  { href: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Admin Header */}
      <header className="border-b border-white/8 bg-navy-card">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-lg font-bold text-white tracking-tight">
              Admin Panel
            </Link>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-accent/20 text-green-bright font-medium">
              Bookmaker
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-white/50 hover:text-white/70 transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded-lg border border-white/15 text-white/70 hover:bg-white/5 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Admin Nav */}
      <div className="border-b border-white/8 bg-navy-card/50 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-0.5 -mb-px">
            {ADMIN_NAV.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-green-bright text-green-bright'
                      : 'border-transparent text-white/50 hover:text-white/70'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Admin Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{children}</main>
    </div>
  );
}
