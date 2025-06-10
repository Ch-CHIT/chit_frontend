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

const BtnViewerLogin = ({
  channelId: paramsChannelId,
  sessionCode: paramsSessionCode,
  streamerInfo,
}: BtnLoginProps) => {
  const router = useRouter();
  const setRole = useAuthStore((state) => state.setRole);
  const {
    setStreamerInfo,
    setSessionCode,
    setChannelId,
    channelId: stateChannelId,
    sessionCode: stateSessionCode,
  } = useChannelStore((state) => state);
  const setSessionInfo = useContentsSessionStore((state) => state.setSessionInfo);
  const accessToken = useAuthStore((state) => state.accessToken);
  const channelId = paramsChannelId ?? stateChannelId;
  const sessionCode = paramsSessionCode ?? stateSessionCode;

  useEffect(() => {
    if (streamerInfo === null) {
      alert('channelId가 잘못됐거나 해당 스트리머의 방송 정보가 없습니다.');
      router.push(`/${channelId}/error`);
      return;
    }

    setStreamerInfo(streamerInfo);
    if (sessionCode) {
      setSessionInfo((prev) => ({
        ...prev,
        sessionCode,
      }));
    }
  }, [channelId, router, sessionCode, setSessionInfo, setStreamerInfo, streamerInfo]);

  const onClickLogin = async () => {
    setRole('VIEWER');
    setSessionCode(sessionCode);
    setChannelId(channelId);
    if (accessToken) {
      console.log('로그인 상태입니다. 시참 참여 페이지로 이동합니다.');
      router.push(`/viewer/${channelId}/${sessionCode}/participation`);
    } else {
      window.location.href = process.env.NEXT_PUBLIC_API_URL || '';
    }
  };

  return (
    <BtnWithChildren type={'default'} onClickHandler={onClickLogin}>
      로그인하고 3초만에 시참참여하기
    </BtnWithChildren>
  );
};

export default BtnViewerLogin;
