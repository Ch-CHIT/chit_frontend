'use client';

import CommonLayout from '@/components/layout/CommonLayout';
import StreamerTools from '@/components/molecules/StreamerTools';
import makeUrl from '@/lib/makeUrl';
import {
  createContentsSession,
  deleteContentsSession,
  getContentsSessionInfo,
  putContentsSessionNextGroup,
} from '@/services/streamer/streamer';
import useChannelStore from '@/store/channelStore';
import useContentsSessionStore from '@/store/sessionStore';
import { ParticipantResponseType, useSSEStore } from '@/store/sseStore';
import useAuthStore from '@/store/authStore';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';

import ViewerList from '@/components/molecules/ViewerList';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import useDetectExit from '@/hooks/useDetectExit';
import { heartBeat } from '@/services/common/common';
import { useRouter } from 'next/navigation';
import { Result } from '@/services/streamer/type';
import { logout } from '@/services/auth/auth';
import { SessionStatus } from '@/constants/status';
import { mergeParticipants } from '@/lib/mergeParticipants';

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
  const [menu, setMenu] = useState(0); // 0 전체인원 1/고정인원/2현재인원
  const router = useRouter();
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

  //브라우저 종료시 실행되는 콜백 함수
  const handleExit = async () => {
    alert('⚠️ 로그아웃 되었습니다.');
    if (accessToken) {
      toast.warn('세션이 종료되었습니다.');
      await logout({ accessToken });

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
      queryClient.setQueryData(['participants'], () => ({
        pages: [],
        pageParams: [0],
      })); // participants 호출
      queryClient.refetchQueries({ queryKey: ['participants'] }); // 쿼리 재요청 (첫 페이지부터)
    }
  };

  //이벤트 발생에 따른 로드
  useEffect(() => {
    if (currentParticipants) {
      // 1. status가 LEFT인 참가자는 제외

      queryClient.setQueryData<InfiniteParticipantsData>(
        ['participants'],
        (oldData: InfiniteParticipantsData | undefined) => {
          if (!oldData) return;
          const oldParticipants = oldData.pages.flatMap((page) => page.participants || []);
          let newParticipants = mergeParticipants(oldParticipants, currentParticipants);

          newParticipants = newParticipants.filter((p) => p.status !== 'LEFT');
          // //이벤트로 발생한 데이터와 페이지네이션으로 데이터 발생시 통합 관리
          // let newParticipants: ParticipantResponseType[] = [];
          // if (Array.isArray(currentParticipants) && currentParticipants.length > 0) {
          //   // 기존 + 새 participants 통합 후 필터링

          //   const currentIds = new Set(currentParticipants.map((p) => p.viewerId));
          //   const oldParticipants = oldData.pages.flatMap((page: any) => page.participants || []);
          //   // 기존 참가자 중 current에 아직 남아 있는 유저만 유지 (나간 유저 제거 및 중복삭제)
          //   newParticipants = oldParticipants.filter((p) => currentIds.has(p.viewerId) === false); // current에 없는 유저만 유지해서 중복 제거

          //   // current에는 최신 유저 상태가 들어있으므로 우선순위로 맨 앞에 붙인다
          //   newParticipants = [...currentParticipants];
          // }

          newParticipants.sort((a, b) => {
            if (a.fixedPick === b.fixedPick) {
              return a.order - b.order;
            }
            return b.fixedPick ? 1 : -1;
          });

          return {
            ...oldData,
            pages: [
              { ...oldData.pages[0], participants: newParticipants },
              ...oldData.pages.slice(1),
            ],
          };
        },
      );
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
        filteredParticipants = filteredParticipants.filter(
          (participant) => participant.round === 1, //현재 순서인 사람만 추가
        );
      }
    }

    return filteredParticipants;
  }, [data?.pages, menu]);

  const loadMoreData = async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    await fetchNextPage();
  };

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

  //세션 생성 함수
  const onCreateSession = async () => {
    if (sessionInfo && accessToken) {
      const { gameParticipationCode, maxGroupParticipants } = sessionInfo;
      const reqData = {
        gameParticipationCode,
        maxGroupParticipants,
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
          router.push('/');
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
      !isProcessing
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
  ]);

  console.log(currentParticipants);
  if (!isTokenLoading) return <div>로딩중입니다.</div>;
  const maxGroupParticipants = sessionInfo?.maxGroupParticipants ?? 1;
  return (
    <CommonLayout>
      {isTokenLoading && sessionInfo && (
        <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
          <section id="controlBox" className="w-full">
            <StreamerTools
              setNextPath={setNextPath}
              onClickSessionHandler={onClickSessionOnOff}
              isSessionOn={!!isSessionOn}
              sessionCode={sessionInfo?.sessionCode}
              channelId={channelId!}
            />
          </section>
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
        </div>
      )}
    </CommonLayout>
  );
}
