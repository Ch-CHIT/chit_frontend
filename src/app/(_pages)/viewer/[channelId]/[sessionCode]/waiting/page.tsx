'use client';

import useChannelStore from '@/store/channelStore';
import { useEffect, useState } from 'react';
import useAuthStore from '@/store/authStore';
import { useSSEStore, ViewerStatus } from '@/store/sseStore';
import { toast } from 'react-toastify';
import useParamsParser from '@/hooks/useParamsParser';
import BtnWithChildren from '@/components/atoms/button/BtnWithChildren';
import Live from '@/components/atoms/label/Live';
import OFF from '@/components/atoms/label/Off';
import ViewerPageLayout from '@/components/layout/ViewerPageLayout';
import { deleteContentsSessionViewerLeave } from '@/services/viewer/viewer';
import { useRouter } from 'next/navigation';
import useParentPath from '@/hooks/useParentPath';
import copyClipBoard from '@/lib/copyClipBoard';
import useBeforeUnload from '@/hooks/useBeforeUnload';
import { heartBeat } from '@/services/common/common';
import makeUrl from '@/lib/makeUrl';
import MediumProfileImg from '@/components/atoms/profile/MediumProfileImg';
import CopyIcon from '../../../../../../../public/assets/icons/CopyIcon';

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
    isRehydrated: isViewerInfoLoading = false,
  } = useSSEStore();
  //세션인포 찾기
  useBeforeUnload();

  //시참 종료 버튼 클릭 시
  const onClickSessionCloseHandler = async () => {
    console.log('🛑세션종료');
    if (sessionCode && accessToken) {
      const response = await deleteContentsSessionViewerLeave({
        accessToken,
        sessionCode,
      });

      if (response.status === 200) {
        toast.success('세션이 종료되었습니다.');
        router.replace(parentPath);
      }
    }
  };

  useEffect(() => {
    if (viewerStatus === ViewerStatus.KICKED) {
      toast.success('시참에서 강퇴처리되었습니다.');
      router.replace(parentPath + '/ban');
    } else if (viewerStatus === ViewerStatus.SESSION_CLOSED) {
      toast.success('시참이 종료되었습니다.');
      router.replace(parentPath);
    }
  }, [parentPath, router, viewerStatus]);

  const [gameCode, setGameCode] = useState<string | null>(null);

  //gameCode event처리
  useEffect(() => {
    setGameCode(viewerSessionInfo?.gameParticipationCode ?? null);
  }, [isViewerInfoLoading, viewerSessionInfo]);

  //rerender
  useEffect(() => {}, [isTokenLoading, streamerInfo, viewerSessionInfo, isViewerInfoLoading]);

  useEffect(() => {
    // 처음 한 번 실행
    if (sessionCode && viewerNickname && accessToken) {
      heartBeat(accessToken, sessionCode);
      startSSE(
        makeUrl({
          accessToken,
          sessionCode,
          viewerNickname,
        }),
      );
    }

    // 인터벌 시작

    const intervalId = setInterval(() => {
      if (sessionCode && accessToken) heartBeat(accessToken, sessionCode);
    }, 10000); // 10초

    // 언마운트될 때 인터벌 정리
    return () => {
      clearInterval(intervalId);
    };
  }, [accessToken, isTokenLoading, sessionCode, startSSE, viewerNickname]);

  if (!streamerInfo) {
    router.replace(`/${channelId}/${sessionCode}`);
  }

  return (
    isTokenLoading &&
    streamerInfo &&
    viewerSessionInfo &&
    isViewerInfoLoading && (
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
              <div className="mt-1 flex w-full flex-row items-center justify-center text-bold-large">
                <span className="overflow-hidden truncate whitespace-nowrap">{gameCode}</span>
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
        {/* 나중에 1번 2번 3버 이런식으로 할 것 */}
        <section className="flex w-full flex-1 flex-col items-center justify-center">
          <p className="text-bold-large">내 순서는</p>
          {viewerSessionInfo?.isReadyToPlay ? (
            <p className="flex flex-row items-center justify-center text-bold-big text-primary">
              지금 참여
            </p>
          ) : (
            <p className="flex flex-row items-center justify-center text-bold-big text-primary">
              {`${viewerSessionInfo!.order!}`}번
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
    )
  );
}
