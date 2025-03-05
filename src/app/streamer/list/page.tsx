'use client';

import CommonLayout from '@/components/layout/CommonLayout';
import StreamerTools from '@/components/molecules/StreamerTools';
import MemberCard from '@/components/organisms/MemberCard';
import makeUrl from '@/lib/makeUrl';
import {
  createContentsSession,
  deleteContentsSession,
  getContentsSessionInfo,
} from '@/services/streamer/streamer';
import useChannelStore from '@/store/channelStore';
import useContentsSessionStore, {
  CurrentParticipants,
} from '@/store/sessionStore';
import { useSSEStore } from '@/store/sseStore';
import useAuthStore from '@/store/store';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import useThrottle from '@/hooks/useThrottle';

enum SessionStatus {
  INITIAL = 1,
  OPEN = 2,
  CLOSED = 0,
}

export default function List() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const sessionInfo = useContentsSessionStore((state) => state.sessionInfo);
  const { startSSE, stopSSE, isConnected, contentsSessionInfo } = useSSEStore();
  const channelId = useChannelStore((state) => state.channelId);
  const isTokenLoading = useAuthStore((state) => state.isRehydrated);
  const [isSessionOn, setIsSessionOn] = useState<SessionStatus>(
    SessionStatus.INITIAL,
  );
  const [currentParticipants, setCurrentParticipants] = useState<
    CurrentParticipants[]
  >([]);

  //세션 생성 함수
  const onCreateSession = async () => {
    if (sessionInfo) {
      const { gameParticipationCode, maxGroupParticipants } = sessionInfo;
      const reqData = {
        gameParticipationCode,
        maxGroupParticipants,
      };

      const response = await createContentsSession(reqData, accessToken);
      console.log('Res');
      console.log(response);
      return response.status;
    }
  };

  //스트리머 세션 컨트롤 핸들러
  const onClickSessionOnOff = async () => {
    if (!accessToken) {
      toast.warn('잠시후 다시 시도해주세요');
      return;
    }

    // 상태변화 sessionOn=>sessionOff
    if (isSessionOn) {
      const response = await deleteContentsSession(accessToken);
      if (response.status !== 200) {
        toast.warn('에러가 발생했습니다. 나중에 다시 시도해 주세요');
        return;
      }
      if (
        isSessionOn === SessionStatus.INITIAL ||
        isSessionOn === SessionStatus.OPEN
      ) {
        stopSSE();
        setIsSessionOn(SessionStatus.CLOSED);
        toast.success('시참이 종료되었습니다.');
        return;
      }
    } else {
      // 상태변화 sessionOff=>sessionOn
      const status = await onCreateSession();
      if (status !== 200) {
        toast.warn('에러가 발생했습니다. 나중에 다시 시도해 주세요');
        return;
      }

      const url = makeUrl({ accessToken, isStreamer: true });
      startSSE(url);
      setIsSessionOn(SessionStatus.OPEN);
      toast.success('시참이 시작되었습니다.');
      return;
    }

    toast.warn('요청에 실패했습니다. 잠시후 다시 시도해주세요');
  };

  //갱신되는 정보가 있을때 참가자 정보 받아옴
  const fetchParticipantsData = useCallback(async () => {
    if (!isTokenLoading || !isSessionOn) return;

    try {
      const response = await getContentsSessionInfo(accessToken);
      if ('error' in response) {
        // 에러 발생 시 사용자 피드백 제공
        toast.error(`❌에러코드 : ${response.status} 오류: ${response.error}`, {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      } else {
        const data = response.data;
        const newParticipants = data?.participants?.content ?? [];
        setCurrentParticipants(
          newParticipants, // 기존 데이터 유지하면서 새 데이터 추가
        );
        console.log('newParticipants');
        console.log(newParticipants);
      }
    } catch (error) {
      console.error('데이터 가져오기 실패:', error);
    }
  }, [accessToken, isSessionOn, isTokenLoading]);
  const throttledFetchParticipants = useThrottle(fetchParticipantsData, 1000);

  //이벤트 발생시에만 불러오는 useEffect
  useEffect(() => {
    console.log('hit2');

    if (contentsSessionInfo) {
      console.log('hit');
      throttledFetchParticipants();
    }
  }, [contentsSessionInfo, throttledFetchParticipants]);
  useEffect(() => {
    if (accessToken && !isConnected) {
      console.log('🔄 SSE 자동 시작');
      const url = makeUrl({ accessToken, isStreamer: true });
      startSSE(url);
    }
  }, [accessToken, isConnected, startSSE]); // ✅ accessToken이 바뀔 때마다 SSE 연결

  useEffect(() => {
    return () => {
      console.log('🛑 컴포넌트 언마운트 시 SSE 종료');
      stopSSE();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ 언마운트 시 한 번만 실행

  if (!isTokenLoading) return <div>로딩중입니다.</div>;

  return (
    isTokenLoading &&
    sessionInfo && (
      <CommonLayout>
        <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
          <section id="controlBox" className="w-full">
            <StreamerTools
              onClickSessionHandler={onClickSessionOnOff}
              isSessionOn={!!isSessionOn}
              sessionCode={sessionInfo?.sessionCode}
              channelId={channelId!}
            />
            {!isSessionOn ? (
              <p className="mb-5 mt-4 text-bold-middle">시참을 시작해주세요</p>
            ) : currentParticipants.length === 0 ? (
              <p className="mb-5 mt-4 text-bold-middle">아직 참여자가 없어요</p>
            ) : (
              <p className="mb-5 mt-4 text-bold-middle">
                총{' '}
                <span className="text-primary">
                  {currentParticipants.length}명
                </span>
                이 참여중이에요
              </p>
            )}
          </section>
          <section className="w-full flex-1">
            <div id="listNav " className="mb-3 flex flex-row justify-between">
              <ul className="flex flex-row items-center text-medium-large">
                <li className="menutab mr-3 last:mr-0">전체 인원</li>
                <li className="menutab mr-3 last:mr-0">고정 인원</li>
                <li className="menutab mr-3 last:mr-0">현재 인원</li>
              </ul>
              <div className="rounded-md bg-background-sub p-2 text-semi-bold text-secondary">
                다음 파티 호출 🔈
              </div>
            </div>
            <div id="list" className="flex w-full flex-1 flex-col">
              {!isSessionOn ? (
                <div>시참을 시작해주세요.</div>
              ) : currentParticipants.length === 0 ? (
                <div>유저를 기다리는 중입니다.</div>
              ) : (
                currentParticipants.map((participant, index) => (
                  <div
                    key={index}
                    id="partyblock"
                    className="flex h-full w-full flex-row"
                  >
                    <div
                      id="partyOrder"
                      className="mr-[6px] flex w-7 items-center justify-center rounded-md bg-background-sub text-bold-small text-secondary"
                    >
                      {index + 1}
                    </div>
                    <div id="partyMembers" className="flex-1 flex-col">
                      <MemberCard
                        accessToken={accessToken}
                        refreshUsers={throttledFetchParticipants}
                        memberId={participant.memberId}
                        zicName={`${participant.chzzkNickname}`}
                        gameNicname={`${participant.gameNickname}`}
                        isHeart={participant.fixedPick}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </CommonLayout>
    )
  );
}
