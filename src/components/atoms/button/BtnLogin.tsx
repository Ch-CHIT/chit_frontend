'use client';
import { UserRoleType } from '@/store/authStore';
import NaverLogo from '../../../../public/assets/logo/NaverLogo';
import BtnWithChildren from './BtnWithChildren';
import { notFound } from 'next/navigation';

type BtnLoginProps = {
  role?: UserRoleType;
};

const BtnLogin = ({ role }: BtnLoginProps) => {
  if (!role) {
    notFound();
  }

  const onClickLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}`;
  };

  return (
    <BtnWithChildren onClickHandler={onClickLogin}>
      <NaverLogo width={18} height={18}></NaverLogo> 로그인하고 3초만에 시참 생성하기
    </BtnWithChildren>
  );
};

export default BtnLogin;
