
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-provider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useSocialAccounts() {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_URL}/api/social-accounts`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setAccounts(data);
          } else {
            console.error('Failed to fetch social accounts');
          }
        } catch (error) {
          console.error('Error fetching social accounts:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAccounts();
  }, [token]);

  return { accounts, loading };
}
