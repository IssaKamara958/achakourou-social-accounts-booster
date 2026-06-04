import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AccountCardProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function AccountCard({ user }: AccountCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image || ''} alt={user.name || 'User Avatar'} />
            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{user.name || 'User Name'}</p>
            <p className="text-sm text-muted-foreground">{user.email || 'user@example.com'}</p>
          </div>
        </div>
        <div>
          <p className="font-medium">Account Status:</p>
          <Badge variant="outline" className="mt-1">Active</Badge>
        </div>
        <div>
          <p className="font-medium">Plan:</p>
          <Badge className="mt-1">Free Tier</Badge>
        </div>
        <Button variant="outline" className="w-full">
          Manage Subscription
        </Button>
      </CardContent>
    </Card>
  );
}
