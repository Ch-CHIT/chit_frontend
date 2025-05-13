'use client';

import { useEffect, useState } from 'react';

type hydrateProviderProps = {
  children: React.ReactNode;
};

const HydrateProvider = ({ children }: hydrateProviderProps) => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null; // or loading spinner

  return <>{children}</>;
};

export default HydrateProvider;
