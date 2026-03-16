'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/markets', label: 'Markets' },
  { href: '/leaderboard', label: 'Board' },
  { href: '/teams', label: 'Teams' },
  { href: '/rules', label: 'Rules' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-navy">
      {/* Desktop */}
      <header className="hidden md:flex sticky top-0 z-40 bg-navy border-b border-white/[0.06] items-center justify-between px-6 h-11">
        <Link href="/" className="text-sm font-bold text-white/90">MattBet</Link>
        <nav className="flex items-center gap-0">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}
              className={`px-3 py-1 text-xs font-medium ${isActive(item.href) ? 'text-white' : 'text-white/35 hover:text-white/60'}`}>
              {item.label}
            </Link>
          ))}
          <Link href="/my-bets" className="ml-3 text-xs font-medium text-green-bright/70 hover:text-green-bright">My Bets</Link>
        </nav>
      </header>

      {/* Mobile */}
      <header className="md:hidden sticky top-0 z-40 bg-navy border-b border-white/[0.06] flex items-center justify-between px-4 h-10">
        <Link href="/" className="text-sm font-bold text-white/90">MattBet</Link>
        <Link href="/my-bets" className="text-[11px] font-medium text-green-bright/70">My Bets</Link>
      </header>

      <main className="pb-bottom-nav md:pb-0">{children}</main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-navy border-t border-white/[0.06] z-50 flex">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex-1 py-2 text-center text-[10px] font-medium ${isActive(item.href) ? 'text-green-bright' : 'text-white/25'}`}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
