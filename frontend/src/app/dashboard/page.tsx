import React from 'react';
import { SessionProvider } from 'next-auth/react'; // Assuming next-auth is used for session management
import { api } from '@/utils/api'; // Assuming api utility is in this path
import DashboardLayout from '@/components/layouts/dashboard-layout';
import AccountCard from '@/components/dashboard/account-card';
import SocialConnect from '@/components/social/social-connect';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  // Assuming useSession hook or similar is available for accessing session data
  // const { data: session, status } = useSession();

  // Placeholder for session data and status
  const session = { user: { name: 'John Doe', email: 'john.doe@example.com' } };
  const status = 'authenticated';

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        {status === 'authenticated' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AccountCard user={session.user} />
            <SocialConnect />
            {/* Add more dashboard widgets/cards as needed */}
            <div className="md:col-span-2">
              <Button onClick={() => alert('View detailed analytics')}>
                View Detailed Analytics
              </Button>
            </div>
          </div>
        ) : (
          <p>Please log in to view your dashboard.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
