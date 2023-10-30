'use client'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Spinner from './Spinner';

export function withAuth(Component: React.ComponentType) {
  return function AuthenticatedComponent(props: any) {
    const router = useRouter();
    const [ok, setOk] = useState<boolean | null>(null);

    useEffect(() => {
      const authCheck = async () => {
        try {
          const userFromLocalStorage = localStorage.getItem('user');

          if (!userFromLocalStorage) {

            router.push('/login');
            return;
          }

          const user = JSON.parse(userFromLocalStorage);
          if (user.user.role === 0) {
            router.push('/');
          } else if (user.user.role === 1) {
            setOk(true); 
          } else {
  
            router.push('/login');
          }
        } catch (error) {
          console.log(error);
          setOk(false);
        }
      };
      setOk(null);

      authCheck();
    }, [router]);

    if (ok === null) {
      return <Spinner />;
    }

    if (typeof window === 'undefined' || ok === false) {
      router.push('/login');
      return null;
    }

    return <Component {...props} />;
  };
}
