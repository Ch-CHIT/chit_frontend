//todo 임시적용, 추후 삭제
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import CommonLayout from '@/components/layout/CommonLayout';
import StreamerTools from '@/components/molecules/StreamerTools';
import makeUrl from '@/lib/makeUrl';
import {
  createContentsSession,
  deleteContentsSession,
  getContentsSessionInfo,
} from '@/services/streamer/streamer';
import useChannelStore from '@/store/channelStore';
import useContentsSessionStore from '@/store/sessionStore';
import { ParticipantResponseType, useSSEStore } from '@/store/sseStore';
import useAuthStore from '@/store/store';
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

import { generagtionViewers } from '@/constants/Dummy';
import ViewerList from '@/components/molecules/ViewerList';
import useThrottle from '@/hooks/useThrottle';

enum SessionStatus {
  INITIAL = 1,
  OPEN = 2,
  CLOSED = 0,
}
const LIMIT = 7;
export default function List() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const sessionInfo = useContentsSessionStore((state) => state.sessionInfo);
  const [pages, setPages] = useState(1);
  const { startSSE, stopSSE, isConnected, contentsSessionInfo } = useSSEStore();
  const channelId = useChannelStore((state) => state.channelId);
  const isTokenLoading = useAuthStore((state) => state.isRehydrated);
  const [isSessionOn, setIsSessionOn] = useState<SessionStatus>(
    SessionStatus.INITIAL,
  );
  const [currentParticipants, setParticipantResponseType] = useState<
    ParticipantResponseType[]
  >([]);

  // todo : 테스트용 함수
  useEffect(() => {
    console.log('hit');
    testfetchParticipants();
    console.log('page:' + pages);
  }, [pages]); // pages가 바뀔 때마다 호출

  const testfetchParticipants = useCallback(() => {
    if (sessionInfo) {
      const { maxGroupParticipants } = sessionInfo;
      if (!maxGroupParticipants) {
        console.log('값없음');
        return;
      }
      console.log(maxGroupParticipants);
      const newParticipants = [
        ...currentParticipants,
        ...generagtionViewers(pages, LIMIT),
      ];
      setParticipantResponseType(newParticipants);
      return newParticipants;
    }
  }, [sessionInfo, currentParticipants, pages]);

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
        setParticipantResponseType(
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

  //todo 테스트 동안만 잠가놓는 최초 데이터 불러오는 api
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
  const maxGroupParticipants = sessionInfo?.maxGroupParticipants ?? 1;
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
          </section>
          <section id="infoBox" className="w-full">
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
          <section className="mb-3 flex min-h-[34px] w-full">
            <div id="listNav " className="flex w-full flex-row justify-between">
              <ul className="flex flex-row items-center text-medium-large">
                <li className="menutab mr-3 last:mr-0">전체 인원</li>
                <li className="menutab mr-3 last:mr-0">고정 인원</li>
                <li className="menutab mr-3 last:mr-0">현재 인원</li>
              </ul>
              <div className="rounded-md bg-background-sub p-2 text-semi-bold text-secondary">
                다음 파티 호출 🔈
              </div>
            </div>
          </section>
          <section className="w-full flex-1 overflow-y-auto">
            {!isSessionOn ? (
              <div>시참을 시작해주세요.</div>
            ) : currentParticipants.length === 0 ? (
              <div>유저를 기다리는 중입니다.</div>
            ) : (
              <ViewerList
                accessToken={accessToken}
                currentParticipants={currentParticipants}
                loadMoreItems={() => setPages((prev) => prev + 1)}
                maxGroupParticipants={maxGroupParticipants}
                key={'viewerList'}
              ></ViewerList>
            )}
          </section>
        </div>
      </CommonLayout>
    )
  );
}
