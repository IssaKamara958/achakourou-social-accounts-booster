import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function ContentPage() {
  const { user } = useAuth(); // Assuming useAuth provides user information

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Content Management</h1>
      {user ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Welcome, {user.name}!</p>
            {/* Add content creation/editing tools here */}
            <div className="mt-4">
              <Textarea placeholder="Create new content..." className="min-h-[150px]" />
              <Button className="mt-2">Save Content</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p>Please log in to manage your content.</p>
      )}
    </div>
  );
}
