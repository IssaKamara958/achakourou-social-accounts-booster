import React from 'react';
import DashboardLayout from '@/components/layouts/dashboard-layout'; // Assuming DashboardLayout is in this path

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Dashboard content will be rendered here */}
      <div className="p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome to your dashboard!</p>
      </div>
    </DashboardLayout>
  );
}
