
      'use client';

      import React from 'react';
      import Link from 'next/link';
      import { Button } from '@/components/ui/button';
      import { Input } from '@/components/ui/input';
      import { Label } from '@/components/ui/label';
      import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
      import { useAuth } from '@/hooks/useAuth';

      export default function RegisterPage() {
        const { signUp, error } = useAuth();
        const [username, setUsername] = React.useState('');
        const [password, setPassword] = React.useState('');
        const [confirmPassword, setConfirmPassword] = React.useState('');

        const handleRegister = async () => {
          if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
          }
          await signUp(username, password);
        };

        return (
          <div className="flex items-center justify-center min-h-screen">
            <Card className="w-[350px]">
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>Create a new account.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={e => { e.preventDefault(); handleRegister(); }}>
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
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                      />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full">
                      Register
                    </Button>
                  </div>
                </form>
                <p className="mt-4 text-center text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="underline">
                    Login
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        );
      }
    