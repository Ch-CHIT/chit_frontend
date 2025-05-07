'use client';

import ChitLogo from '../../../../public/assets/logo/ChitLogo';
import NaverLogo from '../../../../public/assets/logo/NaverLogo';
import BtnWithChildren from '@/components/atoms/button/BtnWithChildren';
import CommonLayout from '@/components/layout/CommonLayout';

export default function Home() {
  const onClickLogin = async () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/naver';
  };

  return (
    <CommonLayout>
      <section className="flex h-full w-full flex-1 flex-col items-center justify-center">
        <p className="mb-2 text-bold-middle text-white">더 쉽고 편한 시참 관리</p>
        <ChitLogo width={160} height={78}></ChitLogo>
      </section>
      <BtnWithChildren onClickHandler={onClickLogin}>
        <NaverLogo width={18} height={18}></NaverLogo>
        로그인하고 3초만에 시참 생성하기
      </BtnWithChildren>
    </CommonLayout>
  );
}
