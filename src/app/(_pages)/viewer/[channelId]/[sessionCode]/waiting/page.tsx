'use client';

import { useRouter } from 'next/navigation';
import { deleteContentsSessionViewerLeave } from '@/services/viewer/viewer';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import useChannelStore from '@/store/channelStore';
import { useSSEStore, ViewerStatus } from '@/store/sseStore';
import { useHeartBeat } from '@/hooks/useHeartBeat';
import useParamsParser from '@/hooks/useParamsParser';
import useParentPath from '@/hooks/useParentPath';
import useBeforeUnload from '@/hooks/useBeforeUnload';

import copyClipBoard from '@/lib/copyClipBoard';
import makeUrl from '@/lib/makeUrl';
import BtnWithChildren from '@/components/atoms/button/BtnWithChildren';
import ViewerPageLayout from '@/components/layout/ViewerPageLayout';
import OFF from '@/components/atoms/label/Off';
import Live from '@/components/atoms/label/Live';
import MediumProfileImg from '@/components/atoms/profile/MediumProfileImg';
import CopyIcon from '../../../../../../../public/assets/icons/CopyIcon';
import useAuthStore from '@/store/authStore';
import Loading from '../loading';

const statusMap = {
  [ViewerStatus.KICKED]: {
    text: '시참에서 강퇴처리되었습니다',
    path: '/ban',
    isDisconnected: true,
  },
  [ViewerStatus.SESSION_CLOSED]: {
    text: '시참이 종료되었습니다.',
    path: '',
    isDisconnected: true,
  },
  [ViewerStatus.JOINED]: {
    text: '시참에 참여했습니다.',
    path: '',
    isDisconnected: false,
  },
  [ViewerStatus.LEFT]: {
    text: '시참을 떠났습니다.',
    path: '',
    isDisconnected: true,
  },
};

export default function Page() {
  const streamerInfo = useChannelStore((state) => state.streamerInfo);
  const router = useRouter();
  const parentPath = useParentPath();
  const { sessionCode, channelId } = useParamsParser();
  const { accessToken, isRehydrated: isTokenLoading = false } = useAuthStore();
  const {
    viewerSessionInfo,
    viewerStatus,
    viewerNickname,
    startSSE,
    setViewerStatus,
    isRehydrated: isViewerInfoLoading = false,
  } = useSSEStore();
  const [gameCode, setGameCode] = useState<string | null>(null);

  if (!streamerInfo) {
    router.replace(`/${channelId}/${sessionCode}`);
  }

  useBeforeUnload();
  useHeartBeat(sessionCode, accessToken, 10000);

  //시청자가 종료 버튼 클릭 시
  const onClickSessionCloseHandler = async () => {
    if (!sessionCode && !accessToken) return;
    const response = await deleteContentsSessionViewerLeave({ accessToken, sessionCode });

    if (response.status === 200) {
      toast.success('세션이 종료되었습니다.');
      router.replace(parentPath);
    }
  };

  //시청자가 의도하지 않았는데 종료 될 때
  useEffect(() => {
    if (!(viewerStatus === ViewerStatus.KICKED || viewerStatus === ViewerStatus.SESSION_CLOSED))
      return;
    const status = statusMap[viewerStatus];
    const path = parentPath + status.path;

    if (status.isDisconnected) setViewerStatus(ViewerStatus.DISCONNECTED);

    router.replace(path);
    toast.success(status.text);
  }, [parentPath, router, setViewerStatus, viewerStatus]);

  //gameCode event처리
  useEffect(() => {
    setGameCode(viewerSessionInfo?.gameParticipationCode ?? null);
  }, [isViewerInfoLoading, viewerSessionInfo]);

  //값이 있을 경우, 최초 한번 실행
  useEffect(() => {
    if (!sessionCode || !viewerNickname || !accessToken) return;
    startSSE(
      makeUrl({
        accessToken,
        sessionCode,
        viewerNickname,
      }),
    );
  }, [accessToken, sessionCode, startSSE, viewerNickname]);

  if (!streamerInfo || !viewerSessionInfo || isTokenLoading || isViewerInfoLoading)
    return <Loading />;

  return (
    <ViewerPageLayout>
      <section className="flex flex-row justify-start">
        <MediumProfileImg
          imageUrl={streamerInfo.channel.channelImageUrl}
          status={streamerInfo.status}
        />
        <div className="ml-3 flex flex-col items-start justify-center">
          {streamerInfo.status === 'OPEN' ? <Live /> : <OFF />}
          <div className="text-bold-large">{streamerInfo.channel.channelName}</div>
        </div>
      </section>
      <section className="mt-5 flex w-full flex-col items-start">
        {gameCode ? (
          <>
            <div className="text-bold-small">
              <span className="text-secondary">참여 코드</span>를 입력해서 게임에 참여해주세요
            </div>
            <div className="mt-1 flex flex-row items-center text-bold-large">
              {gameCode}
              <CopyIcon
                width={16}
                height={16}
                className="ml-2"
                onClickHandler={() => copyClipBoard(gameCode)}
              ></CopyIcon>
            </div>
          </>
        ) : (
          <>
            <div className="text-bold-small">순서를 기다려주세요</div>
          </>
        )}
      </section>
      <section className="flex w-full flex-1 flex-col items-center justify-center">
        <p className="text-bold-large">내 순서는</p>
        {viewerSessionInfo?.isReadyToPlay ? (
          <p className="flex flex-row items-center justify-center text-bold-big text-primary">
            지금 참여
          </p>
        ) : (
          <p className="flex flex-row items-center justify-center text-bold-big text-primary">
            {viewerSessionInfo.order}번
          </p>
        )}
      </section>
      <section className="flex w-full items-center justify-center">
        {viewerSessionInfo?.isReadyToPlay ? (
          <div className="m-5 text-bold-middle">스트리머가 당신을 찾고있어요! 🎉</div>
        ) : (
          <div className="m-5 text-bold-middle">방송에서 열심히 응원해주세요! 🎉</div>
        )}
      </section>
      <BtnWithChildren type={'alert'} onClickHandler={onClickSessionCloseHandler}>
        이제 시참 그만할래요
      </BtnWithChildren>
    </ViewerPageLayout>
  );
}
