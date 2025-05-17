import CommonLayout from '@/components/layout/CommonLayout';
import ChitLogo from '../../../public/assets/logo/ChitLogo';
import BtnLogin from '@/components/atoms/button/BtnLogin';
import { cookies } from 'next/headers';
import { UserRoleType } from '@/store/authStore';

export default async function Home() {
  const role = (await cookies()).get('CH_ROLE')?.value as UserRoleType;
  return (
    <CommonLayout>
      <section className="flex h-full w-full flex-1 flex-col items-center justify-center">
        <p className="mb-2 text-bold-middle text-white">더 쉽고 편한 시참 관리</p>
        <ChitLogo width={160} height={78}></ChitLogo>
      </section>
      <BtnLogin role={role ?? 'VIEWER'}></BtnLogin>
    </CommonLayout>
  );
}
