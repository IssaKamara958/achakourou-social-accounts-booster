import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function SocialConnect() {
  const [open, setOpen] = React.useState(false);

  // Placeholder functions for social logins
  const connectGoogle = () => {
    console.log('Connecting to Google...');
    // Implement Google OAuth flow here
    setOpen(false);
  };

  const connectGithub = () => {
    console.log('Connecting to GitHub...');
    // Implement GitHub OAuth flow here
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Connect Social Accounts</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Social Accounts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>Connect your accounts to enable seamless login and data synchronization.</p>
          <Button onClick={connectGoogle} className="w-full">
            Connect with Google
          </Button>
          <Button onClick={connectGithub} className="w-full">
            Connect with GitHub
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
