
      'use client';

      import { useAuth } from '@/hooks/useAuth';
      import { useRouter, usePathname } from 'next/navigation';
      import { useEffect } from 'react';

      export default function CallbackPage() {
        const router = useRouter();
        const pathname = usePathname();
        const { handleOauthCallback } = useAuth();

        useEffect(() => {
          const handler = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const provider = pathname.split('/').pop(); // Get provider from path

            if (code && provider) {
              await handleOauthCallback(provider, code);
              router.push('/dashboard');
            } else {
              // Handle error or redirect to login
              router.push('/login');
            }
          };
          handler();
        }, [pathname, router, handleOauthCallback]);

        return <div>Processing OAuth callback...</div>;
      }
    