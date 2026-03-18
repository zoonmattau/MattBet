'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: '/' },
  { href: '/matches', label: 'Matches', icon: 'M' },
  { href: '/markets', label: 'Markets', icon: '$' },
  { href: '/leaderboard', label: 'Board', icon: '#' },
  { href: '/my-bets', label: 'My Bets', icon: 'B' },
];

const DESKTOP_NAV = [
  { href: '/', label: 'Home' },
  { href: '/matches', label: 'Matches' },
  { href: '/markets', label: 'Markets' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/teams', label: 'Teams' },
  { href: '/rules', label: 'Rules' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <div className="min-h-screen">
      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-40 header-glass">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <Link href="/" className="text-base font-black tracking-tight"><span className="text-white">Matt</span><span className="text-green-bright">Bet</span></Link>
          <nav className="flex items-center gap-1">
            {DESKTOP_NAV.map((item) => (
              <Link key={item.href} href={item.href}
                className={`relative px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'text-white bg-white/[0.06]'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                }`}>
                {item.label}
              </Link>
            ))}
            <Link href="/my-bets"
              className="ml-2 px-3 py-1.5 text-[13px] font-semibold text-green-bright bg-green-bright/10 rounded-md hover:bg-green-bright/15 border border-green-bright/15 hover:border-green-bright/25">
              My Bets
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 header-glass">
        <div className="px-4 h-11 flex items-center justify-between">
          <Link href="/" className="text-[15px] font-black tracking-tight"><span className="text-white">Matt</span><span className="text-green-bright">Bet</span></Link>
          <div className="flex items-center gap-2">
            <Link href="/rules" className="text-[11px] text-white/30 hover:text-white/50">Rules</Link>
            <Link href="/teams" className="text-[11px] text-white/30 hover:text-white/50">Teams</Link>
          </div>
        </div>
      </header>

      <main className="pb-bottom-nav md:pb-0">{children}</main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bottom-nav-glass">
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 relative ${
                  active ? 'text-green-bright' : 'text-white/25'
                }`}>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-green-bright rounded-full" />
                )}
                <span className={`text-[10px] font-semibold ${active ? 'text-green-bright' : 'text-white/30'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
