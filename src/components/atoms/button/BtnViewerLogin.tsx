'use client';

import BtnWithChildren from './BtnWithChildren';
import useAuthStore from '@/store/authStore';
import useChannelStore from '@/store/channelStore';
import useContentsSessionStore from '@/store/sessionStore';
import { StreamerInfo } from '@/services/streamer/type';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type BtnLoginProps = {
  channelId: string;
  sessionCode: string;
  streamerInfo: StreamerInfo | null;
};

const BtnViewerLogin = ({ channelId, sessionCode, streamerInfo }: BtnLoginProps) => {
  const router = useRouter();
  const setRole = useAuthStore((state) => state.setRole);
  const setChannelId = useChannelStore((state) => state.setChannelId);
  const setStreamerInfo = useChannelStore((state) => state.setStreamerInfo);
  const setSessionInfo = useContentsSessionStore((state) => state.setSessionInfo);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (streamerInfo === null) {
      alert('channelId가 잘못됐거나 해당 스트리머의 방송 정보가 없습니다.');
      router.push(`/${channelId}/error`);
      return;
    }
    setChannelId(channelId);
    setStreamerInfo(streamerInfo);
    if (sessionCode) {
      setSessionInfo((prev) => ({
        ...prev,
        sessionCode,
      }));
    }
  }, [channelId, router, sessionCode, setChannelId, setSessionInfo, setStreamerInfo, streamerInfo]);

  const onClickLogin = async () => {
    if (accessToken) {
      router.push(`${sessionCode}/participation`);
    } else {
      window.location.href = process.env.NEXT_PUBLIC_API_URL || '';
    }
    setRole('VIEWER');
  };

  return (
    <BtnWithChildren onClickHandler={onClickLogin}>
      (로그인하고 3초만에) 시참등록하기
    </BtnWithChildren>
  );
};

export default BtnViewerLogin;
