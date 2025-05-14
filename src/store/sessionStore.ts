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
  isRehydrated: boolean; // 상태가 로드 완료되었는지 여부 추가
};

type ContentsSessionAction = {
  setSessionInfo: (update: ContentsSession | ((prev: ContentsSession) => ContentsSession)) => void;
  reset: () => void;
};

//일단 persist 처리
const defaultSessionInfo: ContentsSession = {
  sessionCode: '',
  maxGroupParticipants: 0,
  currentParticipants: 0,
  gameParticipationCode: '',
  participants: undefined,
};

const useContentsSessionStore = create<ContentsSessionState & ContentsSessionAction>()(
  devtools(
    persist(
      (set) => ({
        sessionInfo: defaultSessionInfo,
        isRehydrated: false,
        reset: () => set({ ...defaultSessionInfo, isRehydrated: false }),
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
