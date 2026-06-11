import React from 'react';
import Link from 'next/link';
import { SessionProvider, useSession } from 'next-auth/react'; // Assuming next-auth is used
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'AI Studio', href: '/dashboard/ai-studio' },
  { name: 'Content', href: '/dashboard/content' },
  { name: 'Migration', href: '/dashboard/migration' },
  { name: 'Settings', href: '/dashboard/settings' },
];

function SidebarContent() {
  const { data: session, status } = useSession();

  // Render sidebar only if authenticated
  if (status !== 'authenticated') {
    return null;
  }

  return (
    <aside className="w-64 bg-background border-r h-screen p-4">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-4">
        {/* Example: Add user info or other persistent elements */}
        <p className="text-sm text-muted-foreground">Logged in as: {session.user?.name}</p>
      </div>
    </aside>
  );
}

// Wrap with SessionProvider if this component is not guaranteed to be within one
export default function Sidebar() {
  return (
    <SessionProvider>
      <SidebarContent />
    </SessionProvider>
  );
}
