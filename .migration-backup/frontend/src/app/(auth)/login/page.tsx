
      'use client';

      import React from 'react';
      import Link from 'next/link';
      import { Button } from '@/components/ui/button';
      import { Input } from '@/components/ui/input';
      import { Label } from '@/components/ui/label';
      import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
      import { useAuth } from '@/hooks/useAuth'; // Assuming useAuth hook is in this path

      export default function LoginPage() {
        const { signIn, error } = useAuth();
        const [username, setUsername] = React.useState('');
        const [password, setPassword] = React.useState('');

        const handleLogin = async () => {
          await signIn(username, password);
        };

        return (
          <div className="flex items-center justify-center min-h-screen">
            <Card className="w-[350px]">
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={e => { e.preventDefault(); handleLogin(); }}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Enter your username"
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                      />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full">
                      Login
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        );
      }
    