'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  // Opcional: puedes mostrar un mensaje o spinner de carga mientras se redirecciona
  return (
    <div className="flex justify-center items-center h-screen">
      Redireccionando...
    </div>
  );
}