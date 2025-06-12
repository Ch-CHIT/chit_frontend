'use client';

import CommonLayout from '@/components/layout/CommonLayout';
import StreamerTools from '@/components/molecules/StreamerTools';
import makeUrl from '@/lib/makeUrl';
import {
  createContentsSession,
  deleteContentsSession,
  getContentsSessionInfo,
  getContentsSessionStatus,
  putContentsSessionNextGroup,
} from '@/services/streamer/streamer';
import useChannelStore from '@/store/channelStore';
import useContentsSessionStore from '@/store/sessionStore';
import { ParticipantResponseType, useSSEStore } from '@/store/sseStore';
import useAuthStore from '@/store/authStore';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import ViewerList from '@/components/molecules/ViewerList';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import useDetectExit from '@/hooks/useDetectExit';
import { heartBeat } from '@/services/common/common';
import { useRouter } from 'next/navigation';
import { Result } from '@/services/streamer/type';
import { logout } from '@/services/auth/auth';
import { SessionStatus } from '@/constants/status';
import useLogout from '@/hooks/useLogout';

interface getFetchParticipantsDataResponse {
  participants: ParticipantResponseType[];
  nextPage?: number;
}

type InfiniteParticipantsData = {
  pages: getFetchParticipantsDataResponse[];
  pageParams: unknown[];
};

const fetchParticipantsData = async ({
  pageParam = 1,
  accessToken,
  size = 20,
}: {
  pageParam?: unknown;
  accessToken: string | null;
  size?: number;
}): Promise<Result<getFetchParticipantsDataResponse>> => {
  const page = pageParam as number;

  if (!accessToken) {
    return { success: false, error: { status: 400, code: 400, message: 'accessToken이 없습니다' } };
  }
  const response = await getContentsSessionInfo({ page, accessToken, size });
  if (response.success === false) {
    console.error(`api error 발생: ${response.error}`);
    return { success: false, error: response.error };
  }

  return {
    success: true,
    data: {
      participants: response.data.data.participants?.content || [],
      nextPage: response.data.data.participants?.hasNext ? page + 1 : undefined,
    },
  };
};

export default function List() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const {
    sessionInfo,
    nextPath,
    setSessionInfo,
    reset: resetContentsSession,
    setIsSession,
    setNextPath,
  } = useContentsSessionStore((state) => state);
  const {
    startSSE,
    stopSSE,
    sessionCode,
    isConnected,
    isSessionError,
    isProcessing,
    setProcessing,
    reset: resetSSEStore,
    currentParticipants,
  } = useSSEStore();
  const channelId = useChannelStore((state) => state.channelId);
  const isTokenLoading = useAuthStore((state) => state.isRehydrated);
  const [isSessionOn, setIsSessionOn] = useState<SessionStatus>(SessionStatus.INITIAL);
  const [isSessionOpen, setIsSessionOpen] = useState(false);

  const [menu, setMenu] = useState(0); // 0 전체인원 1/고정인원/2현재인원
  const router = useRouter();
  const maxGroupParticipants = sessionInfo?.maxGroupParticipants ?? 1;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error: isFetchError,
  } = useInfiniteQuery<getFetchParticipantsDataResponse>({
    queryKey: ['participants'],
    enabled: !!accessToken && isSessionOn !== SessionStatus.CLOSED,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetchParticipantsData({
        pageParam,
        accessToken,
        size: 10,
      });
      if (response.success) {
        console.log('fetchParticipantsData', response.data);
        return response.data;
      }
      return {
        participants: [],
        nextPage: undefined,
      };
    },

    retryDelay: () => 5000,

    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined, // 다음 페이지 정보
    staleTime: 0,
  });
  const resetLocal = useLogout();

  //브라우저 종료시 실행되는 콜백 함수
  const handleExit = async () => {
    alert('⚠️ 로그아웃 되었습니다.');
    if (accessToken) {
      toast.warn('세션이 종료되었습니다.');
      await logout({ accessToken });
      resetLocal();

      router.replace('/');
    }
    //로그아웃 api 쓰기
  };

  useDetectExit(handleExit);

  //다음 파티 호출 버튼 클릭시 Handler
  const nextPartyCallHandler = async () => {
    if (!accessToken) {
      toast.warn('접근 토큰이 필요합니다. 잠시 후 다시 시도해주세요');
      return;
    }
    const response = await putContentsSessionNextGroup({ accessToken });
    if (response.success) {
      toast.success('다음 파티를 호출 했습니다.');
    }
  };

  useEffect(() => {
    if (currentParticipants) {
      queryClient.setQueryData<InfiniteParticipantsData>(['participants'], () => {
        console.log('currentParticipants', currentParticipants);
        if (currentParticipants.length === 0) {
          return {
            pages: [{ participants: currentParticipants, nextPage: undefined }],
            pageParams: [0],
          };
        }

        // ✅ 4. 전체를 하나의 페이지로 다시 구성
        return {
          pages: [{ participants: currentParticipants, nextPage: undefined }],
          pageParams: [0],
        };
      });
    }
  }, [currentParticipants, queryClient]);

  useEffect(() => {
    setIsSession(true);
    return () => {
      // 언마운트 시 false로
      if (nextPath === '/settings') {
        console.log('✅ /settings 이동 → cleanup 생략');
        setNextPath(null); // 다음 경로 초기화
        return;
      }

      setIsSession(false);
    };
  }, [nextPath, setIsSession, setNextPath]);

  const participants = useMemo(() => {
    let filteredParticipants = data?.pages.flatMap((p) => p.participants || []) ?? [];

    if (filteredParticipants.length > 0) {
      if (menu === 1) {
        //고정인원만 출력
        filteredParticipants = filteredParticipants.filter(
          (participant) => participant.fixedPick === true,
        );
      } else if (menu === 2) {
        const min = Math.min(...filteredParticipants.map((p) => p.round));
        filteredParticipants = filteredParticipants
          .filter(
            (participant) => participant.round === min, //현재 순서인 사람만 추가
          )
          .slice(0, maxGroupParticipants); // 최대 그룹 인원만
      }
    }

    return filteredParticipants;
  }, [data?.pages, maxGroupParticipants, menu]);

  const loadMoreData = async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    await fetchNextPage();
  };

  const fetchSessionStatus = useCallback(async () => {
    if (!channelId && !accessToken) return;

    const response = await getContentsSessionStatus(channelId, accessToken);
    if (response.success) {
      const { isOpen } = response.data;
      setIsSessionOpen(isOpen);

      return isOpen;
    }
  }, [accessToken, channelId]);

  //하트비트 체크
  useEffect(() => {
    if (sessionCode && accessToken) {
      heartBeat(accessToken, sessionCode);

      const intervalId = setInterval(() => {
        heartBeat(accessToken, sessionCode);
      }, 10000); // 10초

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [accessToken, isTokenLoading, sessionCode]);

  useEffect(() => {
    if (!accessToken || !channelId) return;

    // 최초 한 번 실행
    fetchSessionStatus();

    // 30초마다 polling
    const intervalId = setInterval(() => {
      fetchSessionStatus();
    }, 15 * 1000); // 30초

    return () => {
      clearInterval(intervalId); // 정리
    };
  }, [accessToken, channelId, fetchSessionStatus]);

  //세션 생성 함수
  const onCreateSession = async () => {
    if (sessionInfo && accessToken) {
      const reqData = {
        gameParticipationCode: sessionInfo.gameParticipationCode,
        maxGroupParticipants: sessionInfo.maxGroupParticipants,
      };

      const response = await createContentsSession(reqData, accessToken);

      return response;
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

      if (
        response &&
        (isSessionOn === SessionStatus.INITIAL || isSessionOn === SessionStatus.OPEN)
      ) {
        stopSSE();
        queryClient.removeQueries({ queryKey: ['participants'] }); // 캐시 제거
        resetSSEStore();
        resetContentsSession();
        setIsSessionOn(SessionStatus.CLOSED);
        toast.success('시참이 종료되었습니다.');
        return;
      }
    } else {
      const response = await onCreateSession();
      if (!response?.success) {
        toast.warn('에러가 발생했습니다. 나중에 다시 시도해 주세요');
        return;
      }

      const url = makeUrl({ accessToken, sessionCode: response.data.data.sessionCode });
      startSSE(url);
      setSessionInfo(response.data.data);
      setIsSessionOn(SessionStatus.OPEN);
      setIsSessionOpen(true);
      toast.success('시참이 시작되었습니다.');
      return;
    }

    toast.warn('요청에 실패했습니다. 잠시후 다시 시도해주세요');
  };

  //todo 테스트 동안만 잠가놓는 최초 데이터 불러오는 api

  useEffect(() => {
    if (accessToken) {
      queryClient.invalidateQueries({
        queryKey: ['participants'],
        refetchType: 'none',
      }); // ✅ accessToken이 변경될 때 데이터 갱신
    }
  }, [accessToken, queryClient]);
  // 1. 세션 에러 감지 및 처리
  // ✅ 세션 에러 감지 → stop + 처리 + 라우팅
  useEffect(() => {
    const handleError = () => {
      if (isSessionError && isProcessing && isSessionOn !== SessionStatus.CLOSED) {
        console.log('🚨 세션 에러 발생 - SSE 중지 및 홈으로 이동');
        try {
          resetSSEStore();
          resetContentsSession();
          setIsSessionOpen(false);
          // router.push('/');
        } finally {
          setProcessing(false); // 라우팅 후 unlock
        }
      }
    };

    handleError();
  }, [
    isSessionError,
    isProcessing,
    router,
    setProcessing,
    isSessionOn,
    resetSSEStore,
    resetContentsSession,
  ]);

  // 2. 자동 SSE 연결 감지
  useEffect(() => {
    if (
      accessToken &&
      !isConnected &&
      isSessionOn !== SessionStatus.CLOSED &&
      !isSessionError &&
      !isProcessing &&
      !isSessionOpen // 이 조건 추가
    ) {
      console.log('🔄 SSE 자동 시작');
      const url = makeUrl({ accessToken, sessionCode: sessionInfo?.sessionCode });
      startSSE(url);
    }
  }, [
    accessToken,
    isConnected,
    isProcessing,
    isSessionError,
    isFetchError,
    sessionInfo?.sessionCode,
    startSSE,
    isSessionOn,
    isSessionOpen, // 이거 추가
  ]);

  console.log(participants);
  if (!isTokenLoading) return <div>로딩중입니다.</div>;
  return (
    <CommonLayout>
      {isTokenLoading && sessionInfo && (
        <div
          className={`flex h-full w-full flex-1 flex-col ${isSessionOpen ? 'justify-center' : 'justify-start'} items-center`}
        >
          <section id="controlBox" className="w-full">
            <StreamerTools
              setNextPath={setNextPath}
              onClickSessionHandler={onClickSessionOnOff}
              isSessionOn={!!isSessionOn}
              sessionCode={sessionInfo?.sessionCode}
              channelId={channelId!}
            />
          </section>
          {!isSessionOpen ? (
            <section id="infoBox" className="w-full">
              <p className="mb-5 mt-4 text-bold-middle">⚠️ 현재 세션 연결이 끊어졌습니다.</p>
              <p
                className="w-fulltext-white"
                // onClick={() => {
                //   stopSSE();
                //   startSSE(makeUrl({ accessToken, sessionCode: sessionInfo?.sessionCode }));
                //   setIsSessionOpen(true); // 연결 시도하면 open으로 바꿈
                // }}
              >
                시참 on off 버튼을 이용해서 다시 생성해주세요
              </p>
            </section>
          ) : (
            ''
          )}
          {isSessionOpen && (
            <>
              <section id="infoBox" className="w-full">
                {!isSessionOn ? (
                  <p className="mb-5 mt-4 text-bold-middle">시참을 시작해주세요</p>
                ) : participants.length === 0 ? (
                  <p className="mb-5 mt-4 text-bold-middle">아직 참여자가 없어요</p>
                ) : (
                  <p className="mb-5 mt-4 text-bold-middle">
                    총 <span className="text-primary">{participants.length}명</span>이 참여중이에요
                  </p>
                )}
              </section>
              <section className="mb-3 flex min-h-[34px] w-full">
                <div id="listNav " className="flex w-full flex-row justify-between">
                  <ul className="flex flex-row items-center text-medium-large">
                    <li
                      className={`menutab cursor mr-3 cursor-pointer last:mr-0 ${menu === 0 ? 'text-bold-small text-primary underline underline-offset-4' : ''}`}
                      onClick={() => setMenu(0)}
                    >
                      전체 인원
                    </li>
                    <li
                      className={`menutab cursor mr-3 cursor-pointer last:mr-0 ${menu === 1 ? 'text-bold-small text-primary underline underline-offset-4' : ''}`}
                      onClick={() => setMenu(1)}
                    >
                      고정 인원
                    </li>
                    <li
                      className={`menutab cursor mr-3 cursor-pointer last:mr-0 ${menu === 2 ? 'text-bold-small text-primary underline underline-offset-4' : ''}`}
                      onClick={() => setMenu(2)}
                    >
                      현재 인원
                    </li>
                  </ul>
                  <div
                    onClick={nextPartyCallHandler}
                    className="cursor-pointer rounded-md bg-background-sub p-2 text-semi-bold text-secondary"
                  >
                    다음 파티 호출 🔈
                  </div>
                </div>
              </section>
              <section className="w-full flex-1 overflow-y-auto">
                {!isSessionOn ? (
                  <div>시참을 시작해주세요.</div>
                ) : participants.length === 0 ? (
                  <div>유저를 기다리는 중입니다.</div>
                ) : (
                  <ViewerList
                    participants={participants}
                    loadMoreItems={loadMoreData}
                    maxGroupParticipants={maxGroupParticipants}
                    key={'viewerList'}
                  ></ViewerList>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </CommonLayout>
  );
}
