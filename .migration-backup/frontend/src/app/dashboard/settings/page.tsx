import React from 'react';
import SocialConnect from '@/components/social/social-connect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Social Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <SocialConnect />
        </CardContent>
      </Card>
      {/* Add more settings sections as needed */}
    </div>
  );
}
