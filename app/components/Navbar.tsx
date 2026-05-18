'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `text-sm transition-colors ${
      pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        ? 'text-primary font-semibold'
        : 'text-foreground/80 hover:text-primary'
    }`;

  return (
    <nav className="bg-card border-b border-border px-4 py-3 overflow-x-hidden">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Link href="/dashboard" className="shrink-0 flex justify-center sm:justify-start">
          <Image src="/CaseLogo.png" alt="CaseHacks" width={181} height={105} style={{ height: '36px', width: 'auto' }} className="hidden sm:block" priority />
          <Image src="/CaseLogoMobile.png" alt="CaseHacks" width={577} height={133} style={{ height: '36px', width: 'auto' }} className="block sm:hidden" priority />
        </Link>
        <div className="flex items-center justify-center sm:justify-start gap-4 overflow-x-auto scrollbar-none min-w-0 pb-0.5">
          <Link href="/dashboard" className={linkClass('/dashboard') + ' whitespace-nowrap'}>
            Dashboard
          </Link>
          <Link href="/events" className={linkClass('/events') + ' whitespace-nowrap'}>
            Events
          </Link>
          <Link href="/scan" className={linkClass('/scan') + ' whitespace-nowrap'}>
            Scan
          </Link>
          <Link href="/dashboard/hackers" className={linkClass('/dashboard/hackers') + ' whitespace-nowrap'}>
            Hackers
          </Link>
          <Link href="/dashboard/questions" className={linkClass('/dashboard/questions') + ' whitespace-nowrap'}>
            Questions
          </Link>
          <Link href="/dashboard/team-matching" className={linkClass('/dashboard/team-matching') + ' whitespace-nowrap'}>
            Team Matching
          </Link>
          <Link href="/dashboard/sponsor" className={linkClass('/dashboard/sponsor') + ' whitespace-nowrap'}>
            Sponsors
          </Link>
          <Link href="/admin/approve" className={linkClass('/admin/approve') + ' whitespace-nowrap'}>
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
