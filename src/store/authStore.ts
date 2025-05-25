import { STORAGE_KEYS } from '@/constants/urls';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

export type UserRoleType = 'VIEWER' | 'STREAMER' | 'DEFAULT';

interface AuthState {
  isLogin: boolean;
  role: UserRoleType;
  isRehydrated: boolean; // 상태가 로드 완료되었는지 여부 추가
  accessToken: string | null;
  sessionCode: string;
}

type AuthAction = {
  setAccessToken: (authData: string | null) => void;
  setLogin: (authData: boolean) => void;
  setRole: (role: UserRoleType) => void;
};

//일단 persist 처리

const useAuthStore = create<AuthState & AuthAction>()(
  devtools(
    persist(
      (set) => ({
        accessToken: null,
        isLogin: false,
        isRehydrated: false,
        role: 'VIEWER',
        sessionCode: '',
        setAccessToken: (value: string | null) =>
          set(
            () => ({
              accessToken: value,
            }),
            false,
            'auth/setAccessToken',
          ),
        setLogin: (value: boolean) =>
          set(() => ({
            isLogin: value,
          })),
        setRole: (value: UserRoleType) =>
          set(() => ({
            role: value,
          })),
      }),

      {
        name: STORAGE_KEYS.AuthStorageKey,
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({
          role: state.role,
          isLogin: state.isLogin,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.isRehydrated = true; // 로드 완료 플래그 설정
          }
        },
      },
    ),
    {
      anonymousActionType: STORAGE_KEYS.AuthStorageKey,
      enabled: true,
      name: STORAGE_KEYS.AuthStorageKey,
    },
  ),
);

export default useAuthStore;
