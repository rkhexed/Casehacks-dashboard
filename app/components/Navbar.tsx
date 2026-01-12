import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-card border-b border-border p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-primary">
          CaseHacks
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-foreground/80 hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/events" className="text-sm text-foreground/80 hover:text-primary transition-colors">
            Events
          </Link>
          <Link href="/scan" className="text-sm text-foreground/80 hover:text-primary transition-colors">
            Scan
          </Link>
          <Link href="/dashboard/hackers" className="text-sm text-foreground/80 hover:text-primary transition-colors">
            Hackers
          </Link>
          <Link href="/dashboard/questions" className="text-sm text-foreground/80 hover:text-primary transition-colors">
            Questions
          </Link>
          <Link href="/admin/approve" className="text-sm text-foreground/80 hover:text-primary transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
