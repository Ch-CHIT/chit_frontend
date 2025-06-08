import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { ParticipantResponseType } from './sseStore';
import { STORAGE_KEYS } from '@/constants/urls';

export type ApiResponse<T> = {
  status: number;
  data: T;
};

export type ContentsSession = {
  sessionCode: string;
  maxGroupParticipants: number;
  currentParticipants: number;
  gameParticipationCode: string;
  participants?: ParticipantsInfo;
};

export type Session = {
  sessionCode: string;
  maxGroupParticipants: number;
  currentParticipants: number;
};

export type ParticipantsInfo = {
  content: ParticipantResponseType[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

type ContentsSessionState = {
  sessionInfo: ContentsSession | null;
  isSession: boolean; // 세션이 존재하는지 여부
  isRehydrated: boolean; // 상태가 로드 완료되었는지 여부 추가
  nextPath: string | null; //세션의 다음경로 저장
};

type ContentsSessionAction = {
  setSessionInfo: (update: ContentsSession | ((prev: ContentsSession) => ContentsSession)) => void;
  setIsSession: (isSession: boolean) => void;
  reset: () => void;
  setNextPath: (path: string | null) => void;
};

//일단 persist 처리
const defaultSessionInfo: ContentsSession = {
  sessionCode: '',
  maxGroupParticipants: 0,
  currentParticipants: 0,
  gameParticipationCode: '',
  participants: undefined,
};

// cotentsSessionStore는 시참 세션 정보를 관리하는 zustand 스토어입니다.
//sessionInfo 시참세션의 정보를 담고있습니다.
//   sessionCode: '', :생성된 세션 코드
//   maxGroupParticipants: 0, : 세션의 최대 그룹 수
//   currentParticipants: 0, :현재 참여인원
//   gameParticipationCode: '', : 게임 참여코드
//   participants: undefined, : 참여자 정보 (선택적, undefined로 초기화)
//isSession: false, // 세션이 존재하는지 여부

const useContentsSessionStore = create<ContentsSessionState & ContentsSessionAction>()(
  devtools(
    persist(
      (set) => ({
        nextPath: null,
        sessionInfo: defaultSessionInfo,
        isRehydrated: false,
        isSession: false, // 초기값은 false로 설정
        reset: () => set({ ...defaultSessionInfo, isRehydrated: false }),
        setNextPath: (path) => set({ nextPath: path }),
        setIsSession: (isSession) => set({ isSession }),
        setSessionInfo: (update) =>
          set((state) => ({
            sessionInfo: {
              ...state.sessionInfo, // 기존 값 유지
              ...(typeof update === 'function'
                ? update(state.sessionInfo ?? defaultSessionInfo)
                : update), // 함수형 업데이트도 처리
            },
          })),
      }),
      {
        name: STORAGE_KEYS.SessionStorageKey,
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({
          sessionInfo: state.sessionInfo,
          isSession: state.isSession,
          nextPath: state.nextPath,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.isRehydrated = true; // 로드 완료 플래그 설정
          }
        },
      },
    ),
    {
      anonymousActionType: STORAGE_KEYS.SessionStorageKey,
      enabled: true,
      name: STORAGE_KEYS.SessionStorageKey,
    },
  ),
);

export default useContentsSessionStore;
