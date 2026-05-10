'use client';

import Link from 'next/link';
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
    <nav className="bg-card border-b border-border p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-primary">
          CaseHacks
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className={linkClass('/dashboard')}>
            Dashboard
          </Link>
          <Link href="/events" className={linkClass('/events')}>
            Events
          </Link>
          <Link href="/scan" className={linkClass('/scan')}>
            Scan
          </Link>
          <Link href="/dashboard/hackers" className={linkClass('/dashboard/hackers')}>
            Hackers
          </Link>
          <Link href="/dashboard/questions" className={linkClass('/dashboard/questions')}>
            Questions
          </Link>
          <Link href="/dashboard/team-matching" className={linkClass('/dashboard/team-matching')}>
            Team Matching
          </Link>
          <Link href="/dashboard/sponsor" className={linkClass('/dashboard/sponsor')}>
            Sponsors
          </Link>
          <Link href="/admin/approve" className={linkClass('/admin/approve')}>
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
