import ChitLogo from '../../../public/assets/logo/ChitLogo';
import { Suspense } from 'react';
import AuthInitializer from '@/provider/AuthInitializer';
import Image from 'next/image';

const NavBar = () => {
  return (
    <nav className="relative mb-3 flex h-[32px] w-full flex-row items-center justify-between">
      <ChitLogo width={44} height={22} />
      <Suspense fallback={<Image src="/assets/loading.svg" alt="loading" width="40" height="40" />}>
        <AuthInitializer />
      </Suspense>
    </nav>
  );
};

export default NavBar;
