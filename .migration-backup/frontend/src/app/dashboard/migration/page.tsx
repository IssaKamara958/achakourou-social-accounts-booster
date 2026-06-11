import React from 'react';
import { Button } from '@/components/ui/button';

export default function MigrationPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Migration Tools</h1>
      <p>Select a migration tool to get started.</p>
      <div className="mt-4 flex space-x-4">
        <Button>Start Data Migration</Button>
        <Button>Start Schema Migration</Button>
      </div>
    </div>
  );
}
