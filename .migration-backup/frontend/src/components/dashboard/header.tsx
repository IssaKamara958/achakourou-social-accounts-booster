import React from 'react';
import { SessionProvider, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function HeaderContent() {
  const { data: session, status } = useSession();

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b">
      <Link href="/dashboard" className="text-xl font-bold">
        MyApp
      </Link>
      <div className="flex items-center space-x-4">
        {status === 'authenticated' ? (
          <>
            <Link href="/dashboard/settings">Settings</Link>
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                <AvatarFallback>{session.user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <span>{session.user?.name}</span>
            </div>
            <Button variant="outline" onClick={() => signOut()}>
              Logout
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
}

// Wrap with SessionProvider if this component is not guaranteed to be within one
export default function Header() {
  return (
    <SessionProvider>
      <HeaderContent />
    </SessionProvider>
  );
}
