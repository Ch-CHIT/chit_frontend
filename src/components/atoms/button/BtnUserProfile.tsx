import LogoutConfirmModal from '@/components/molecules/LogoutConfirmModal';
import useLogout from '@/hooks/useLogout';
import useParamsParser from '@/hooks/useParamsParser';
import { logout } from '@/services/auth/auth';
import useAuthStore from '@/store/authStore';
import useChannelStore from '@/store/channelStore';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const BtnUserProfile = () => {
  const { role, accessToken, isLogin } = useAuthStore((state) => state);
  const { streamerInfo } = useChannelStore((state) => state);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { channelId, sessionCode } = useParamsParser();
  const resetLocal = useLogout();
  const channelImage =
    streamerInfo?.channel?.channelImageUrl?.trim() || '/assets/logo/logo_small.svg';

  console.log(isLogin);
  const handleLogout = async () => {
    const userRole = role;
    setIsOpen(false);

    if (accessToken) {
      await logout({ accessToken }).then(() => {
        resetLocal();
        router.refresh();
        if (userRole === 'STREAMER') {
          router.push(`/`);
        } else {
          router.push(`/${channelId}/${sessionCode}`);
        }
      });
    }
  };

  const onClickLogoutModal = () => {
    setIsOpen(true);
  };

  if (!isLogin) {
    return <div></div>;
  }

  return (
    <>
      <div className="group relative z-10 flex h-[52px] w-[52px] items-center justify-center">
        <div className="relative z-20 h-8 w-8 rounded-full transition-shadow duration-200 ease-out group-hover:ring-2 group-hover:ring-primary">
          <Image
            src={channelImage}
            className={`${streamerInfo?.channel?.channelImageUrl?.trim() ? 'object-cover' : 'object-contain p-[1px]'} rounded-full`}
            fill
            alt="profile"
          />
        </div>
        <div className="pointer-events-none absolute right-0 top-[52px] z-20 w-24 flex-col overflow-hidden rounded-2xl border-2 border-primary bg-black text-medium-13 text-white opacity-0 transition-transform duration-200 ease-out will-change-transform group-hover:pointer-events-auto group-hover:scale-[1.02] group-hover:opacity-100">
          <div className="cursor-pointer border-b border-primary px-4 py-2 text-center hover:bg-primary/30">
            마이페이지
          </div>
          <div
            onClick={onClickLogoutModal}
            className="cursor-pointer px-4 py-2 text-center hover:bg-primary/30"
          >
            로그아웃
          </div>
        </div>
      </div>
      {isOpen && <LogoutConfirmModal onConfirm={handleLogout} onCancel={() => setIsOpen(false)} />}
    </>
  );
};

export default BtnUserProfile;
