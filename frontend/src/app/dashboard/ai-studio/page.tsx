import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function AiStudioPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">AI Studio</h1>
      <Textarea placeholder="Type your prompt here..." className="min-h-[200px]" />
      <Button>Generate Content</Button>
    </div>
  );
}
